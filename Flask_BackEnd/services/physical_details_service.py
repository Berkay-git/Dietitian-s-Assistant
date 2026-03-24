from models.models import PhysicalDetails, ClientProgressSnapshot, Client
from collections import defaultdict
from datetime import datetime
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np
from matplotlib.patches import FancyBboxPatch

#Physical Details Table: Weight,  raw data => {'date': '2025-10-01', 'value': 72.4}
def _get_weight_raw(client_id):  #Match the clientID and get all weight records for that client with their measurement dates
    records = (
        PhysicalDetails.query
        .filter_by(ClientID=client_id)
        .filter(PhysicalDetails.Weight.isnot(None))
        .filter(PhysicalDetails.MeasurementDate.isnot(None))
        .order_by(PhysicalDetails.MeasurementDate.asc())
        .all()
    )
    return [{'date': r.MeasurementDate.isoformat(), 'value': float(r.Weight)} for r in records] #Return the of all the raw data

#Physical Details Table: BodyFat raw data => {'date': '2025-10-01', 'value': 18.8},
def _get_bodyfat_raw(client_id): #Match the clientID and get all BodyFat records for that client with their measurement dates
    records = (
        PhysicalDetails.query
        .filter_by(ClientID=client_id)
        .filter(PhysicalDetails.BodyFat.isnot(None))
        .filter(PhysicalDetails.MeasurementDate.isnot(None))
        .order_by(PhysicalDetails.MeasurementDate.asc())
        .all()
    )
    return [{'date': r.MeasurementDate.isoformat(), 'value': float(r.BodyFat)} for r in records]

#clientprogresssnapshot table: AdherenceRate raw data => {'date': '2025-11-01', 'value': 82.5}
def _get_adherence_raw(client_id): #Match the clientID and get all AdherenceRate records for that client with their measurement dates
    records = (
        ClientProgressSnapshot.query
        .filter_by(ClientID=client_id)
        .filter(ClientProgressSnapshot.AdherenceRate.isnot(None))
        .order_by(ClientProgressSnapshot.ProgressDate.asc())
        .all()
    )
    return [{'date': r.ProgressDate.isoformat(), 'value': float(r.AdherenceRate)} for r in records]

#data => {'date': '2025-10-01', 'value': 72.4},
#return => [{"date": "2026-W12", "value": 81.0}, ...] "year-week"
def _group_weekly(data):
    groups = defaultdict(list)
    for r in data:
        d = datetime.strptime(r['date'], '%Y-%m-%d')
        key = d.strftime('%G-W%V')
        groups[key].append(r['value'])  #Seperate week by week, aynı haftaya düşenleri tek bir listede topla. '2026-W12': [72.4, 71.8, 73.0] gibi
    return [{'date': k, 'value': round(sum(v) / len(v), 2)} for k, v in sorted(groups.items())] #k => 2026-W12, v => [72.4, 71.8, 73.0] => return => [{'date': '2026-W12', 'value': 72.4}] gibi, haftalık ortalama değerler döndürür


#data => {'date': '2025-10-01', 'value': 72.4},
#return => [{"date": "2026-03", "value": 81.0}, ...] "year-month"
def _group_monthly(data):
    groups = defaultdict(list)
    for r in data:
        d = datetime.strptime(r['date'], '%Y-%m-%d')
        key = d.strftime('%Y-%m')
        groups[key].append(r['value'])
    return [{'date': k, 'value': round(sum(v) / len(v), 2)} for k, v in sorted(groups.items())]



#Main function for deciding which function should be called based on metric and duration parameters
def get_progress_data(client_id, metric, duration):
    if metric == 'weight':
        raw = _get_weight_raw(client_id)
    elif metric == 'bodyfat':
        raw = _get_bodyfat_raw(client_id)
    elif metric == 'adherence':
        raw = _get_adherence_raw(client_id)
    else:
        return False, 'Invalid metric', None

    if not raw:
        return True, 'No data', []
    print(f"Raw data for {metric}: {raw}")
    if duration == 'weekly':
        data = _group_weekly(raw)
    elif duration == 'monthly':
        data = _group_monthly(raw)
    else:
        data = raw

    return True, 'Success', data


def create_pdf_report(client_id, option='all'): #If option is corrupted in the json format, default is all.
    """
    Generate a PDF progress report for a client.
    option: 'weekly' | 'monthly' | 'all' (both weekly and monthly)
    """
    client = Client.query.get(client_id)
    if not client:
        return None, 'Client not found'

    weight_raw = _get_weight_raw(client_id)
    bodyfat_raw = _get_bodyfat_raw(client_id)
    adherence_raw = _get_adherence_raw(client_id)

    weight_weekly = _group_weekly(weight_raw) if weight_raw else []
    weight_monthly = _group_monthly(weight_raw) if weight_raw else []
    bodyfat_weekly = _group_weekly(bodyfat_raw) if bodyfat_raw else []
    bodyfat_monthly = _group_monthly(bodyfat_raw) if bodyfat_raw else []
    adherence_weekly = _group_weekly(adherence_raw) if adherence_raw else []
    adherence_monthly = _group_monthly(adherence_raw) if adherence_raw else []

    # Decide which grouped datasets to include based on option
    show_weekly = option in ('weekly', 'all')  # If option is 'weekly' or 'all', Include weekly data
    show_monthly = option in ('monthly', 'all') # If option is 'monthly' or 'all', Include monthly data

    buf = io.BytesIO()
    with PdfPages(buf) as pdf:
        # ── Page 1: Cover + Summary ──
        fig = _create_cover_page(client, option, weight_raw, bodyfat_raw, adherence_raw)
        pdf.savefig(fig)
        plt.close(fig)

        # ── Metric chart pages ──
        metric_configs = [
            {
                'raw': weight_raw,
                'weekly': weight_weekly,
                'monthly': weight_monthly,
                'title': 'Weight Progress',
                'ylabel': 'Weight (kg)',
                'color': '#007AFF',
                'secondary_label': 'lbs',
                'secondary_factor': 2.20462,
            },
            {
                'raw': bodyfat_raw,
                'weekly': bodyfat_weekly,
                'monthly': bodyfat_monthly,
                'title': 'Body Fat Progress',
                'ylabel': 'Body Fat (%)',
                'color': '#FF6B35',
            },
            {
                'raw': adherence_raw,
                'weekly': adherence_weekly,
                'monthly': adherence_monthly,
                'title': 'Adherence Rate Progress',
                'ylabel': 'Adherence (%)',
                'color': '#34C759',
            },
        ]

        for cfg in metric_configs:
            if not cfg['raw']:
                continue
            fig = _create_chart_page(
                weekly_data=cfg['weekly'] if show_weekly else [],
                monthly_data=cfg['monthly'] if show_monthly else [],
                title=cfg['title'],
                ylabel=cfg['ylabel'],
                color=cfg['color'],
                option=option,
                secondary_label=cfg.get('secondary_label'),
                secondary_factor=cfg.get('secondary_factor'),
            )
            pdf.savefig(fig)
            plt.close(fig)

    buf.seek(0)
    return buf, None


def _create_cover_page(client, option, weight_raw, bodyfat_raw, adherence_raw):

    option_label = {'weekly': 'Weekly', 'monthly': 'Monthly', 'all': 'Weekly & Monthly'}
    fig = plt.figure(figsize=(8.27, 11.69))  # A4
    fig.patch.set_facecolor('white')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')

    # Header bar
    ax.axhspan(0.88, 1.0, color="#FFFFFF")
    ax.text(0.5, 0.94, "Client Progress Report", fontsize=22, fontweight='bold',
            color="#1A1A2E", ha='center', va='center', transform=ax.transAxes)

    # Client info
    y = 0.84
    info_lines = [
        f"Client: {client.Name}",
        f"Gender: {client.Sex}    |    DOB: {client.DOB or 'N/A'}",
        f"Report Type: {option_label.get(option, 'All')}",
        f"Report Generated: {datetime.now().strftime('%B %d, %Y')}",
    ]
    for line in info_lines:
        ax.text(0.08, y, line, fontsize=11, color='#374151', transform=ax.transAxes)
        y -= 0.035

    # Summary statistics boxes
    y = 0.68
    ax.text(0.08, y, "Summary Statistics", fontsize=14, fontweight='bold',
            color='#1A1A2E', transform=ax.transAxes)
    y -= 0.05 

    metrics_summary = []
    if weight_raw:
        vals = [r['value'] for r in weight_raw]
        first, last = vals[0], vals[-1]
        change = last - first
        metrics_summary.append({
            'title': 'Weight (kg)',
            'current': f'{last:.1f} kg',
            'min': f'{min(vals):.1f}',
            'max': f'{max(vals):.1f}',
            'avg': f'{sum(vals)/len(vals):.1f}',
            'change': f'{"+" if change >= 0 else ""}{change:.1f} kg',
            'change_color': '#EF4444' if change > 0 else '#22C55E',
            'records': len(vals),
            'color': '#007AFF',
        })
    if bodyfat_raw:
        vals = [r['value'] for r in bodyfat_raw]
        first, last = vals[0], vals[-1]
        change = last - first
        metrics_summary.append({
            'title': 'Body Fat (%)',
            'current': f'{last:.1f}%',
            'min': f'{min(vals):.1f}',
            'max': f'{max(vals):.1f}',
            'avg': f'{sum(vals)/len(vals):.1f}',
            'change': f'{"+" if change >= 0 else ""}{change:.1f}%',
            'change_color': '#EF4444' if change > 0 else '#22C55E',
            'records': len(vals),
            'color': '#FF6B35',
        })
    if adherence_raw:
        vals = [r['value'] for r in adherence_raw]
        metrics_summary.append({
            'title': 'Adherence Rate (%)',
            'current': f'{vals[-1]:.1f}%',
            'min': f'{min(vals):.1f}',
            'max': f'{max(vals):.1f}',
            'avg': f'{sum(vals)/len(vals):.1f}',
            'change': '',
            'change_color': '#6B7280',
            'records': len(vals),
            'color': '#34C759',
        })

    for i, m in enumerate(metrics_summary):
        box_y = y - 0.04 - i * 0.14
        box = FancyBboxPatch((0.06, box_y - 0.08), 0.88, 0.12,
                              boxstyle="round,pad=0.01", facecolor='#F9FAFB',
                              edgecolor=m['color'], linewidth=1.5, transform=ax.transAxes)
        ax.add_patch(box)
        ax.text(0.10, box_y, m['title'], fontsize=12, fontweight='bold',
                color=m['color'], transform=ax.transAxes)
        ax.text(0.10, box_y - 0.035,
                f"Current: {m['current']}    Min: {m['min']}    Max: {m['max']}    Avg: {m['avg']}",
                fontsize=9, color='#374151', transform=ax.transAxes)
        ax.text(0.10, box_y - 0.06,
                f"Records: {m['records']}",
                fontsize=9, color='#6B7280', transform=ax.transAxes)
        if m['change']:
            ax.text(0.80, box_y, m['change'], fontsize=12, fontweight='bold',
                    color=m['change_color'], ha='center', transform=ax.transAxes)

    # Footer
    ax.text(0.5, 0.04, "Dietitian's Assistant — Confidential", fontsize=8,
            color='#9CA3AF', ha='center', transform=ax.transAxes)

    return fig


def _create_chart_page(weekly_data, monthly_data, title, ylabel, color, option,
                       secondary_label=None, secondary_factor=None):
    """
    Creates a chart page with 1 or 2 sub-charts depending on option:
    - 'weekly':  weekly line chart only (full page)
    - 'monthly': monthly bar chart only (full page)
    - 'all':     weekly line (top) + monthly bar (bottom)
    """
    show_weekly = option in ('weekly', 'all')
    show_monthly = option in ('monthly', 'all')
    num_charts = int(show_weekly) + int(show_monthly)

    if num_charts == 2:
        fig, axes = plt.subplots(2, 1, figsize=(8.27, 11.69), gridspec_kw={'height_ratios': [1, 1]})
    else:
        fig, ax_single = plt.subplots(1, 1, figsize=(8.27, 11.69))
        axes = [ax_single]

    fig.patch.set_facecolor('white')
    fig.text(0.5, 0.96, title, fontsize=18, fontweight='bold', color='#1A1A2E', ha='center')

    chart_idx = 0

    # ── Weekly line chart ──
    if show_weekly and weekly_data:
        ax = axes[chart_idx]
        chart_idx += 1

        week_labels = [r['date'] for r in weekly_data]
        week_values = [r['value'] for r in weekly_data]
        x_pos = range(len(week_labels))

        ax.set_title('Weekly Averages', fontsize=12, fontweight='bold', color='#374151', pad=12)
        ax.plot(list(x_pos), week_values, '-o', color=color, markersize=5, linewidth=2, alpha=0.9)
        ax.fill_between(list(x_pos), week_values, alpha=0.08, color=color)

        # Trend line
        if len(week_values) >= 3:
            x_num = np.array(list(x_pos), dtype=float)
            z = np.polyfit(x_num, week_values, 1)
            p = np.poly1d(z)
            ax.plot(list(x_pos), p(x_num), '--', color='#EF4444', linewidth=1, alpha=0.7, label='Trend')
            ax.legend(fontsize=8, loc='upper right')

        # Min/max annotations
        min_idx = week_values.index(min(week_values))
        max_idx = week_values.index(max(week_values))
        ax.annotate(f'{week_values[min_idx]:.1f}', xy=(min_idx, week_values[min_idx]),
                    fontsize=7, color='#22C55E', fontweight='bold', ha='center',
                    xytext=(0, -14), textcoords='offset points')
        ax.annotate(f'{week_values[max_idx]:.1f}', xy=(max_idx, week_values[max_idx]),
                    fontsize=7, color='#EF4444', fontweight='bold', ha='center',
                    xytext=(0, 10), textcoords='offset points')

        # Average line
        avg = sum(week_values) / len(week_values)
        ax.axhline(y=avg, color='#9CA3AF', linestyle=':', linewidth=0.8, alpha=0.7)
        ax.text(len(week_values) - 1, avg, f' avg: {avg:.1f}', fontsize=7, color='#9CA3AF', va='bottom')

        # Format x labels as W01, W02...
        display_labels = [f"W{lbl.split('-W')[1]}" if '-W' in lbl else lbl for lbl in week_labels]
        step = max(1, len(display_labels) // 12)
        ax.set_xticks([i for i in x_pos if i % step == 0 or i == len(display_labels) - 1])
        ax.set_xticklabels([display_labels[i] for i in x_pos if i % step == 0 or i == len(display_labels) - 1])

        ax.set_ylabel(ylabel, fontsize=10, color='#374151')
        ax.tick_params(axis='x', rotation=45, labelsize=8)
        ax.tick_params(axis='y', labelsize=8)
        ax.grid(axis='y', alpha=0.3)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        # Secondary y-axis for lbs
        if secondary_label and secondary_factor:
            ax2 = ax.twinx()
            ax2.set_ylabel(f'{ylabel.split("(")[0]}({secondary_label})', fontsize=10, color='#9CA3AF')
            y_min, y_max = ax.get_ylim()
            ax2.set_ylim(y_min * secondary_factor, y_max * secondary_factor)
            ax2.tick_params(axis='y', labelsize=8, labelcolor='#9CA3AF')
            ax2.spines['top'].set_visible(False)

    elif show_weekly:
        ax = axes[chart_idx]
        chart_idx += 1
        ax.text(0.5, 0.5, 'No weekly data available', ha='center', va='center',
                fontsize=12, color='#9CA3AF', transform=ax.transAxes)
        ax.axis('off')

    # ── Monthly bar chart ──
    if show_monthly and monthly_data:
        ax = axes[chart_idx]

        month_labels = []
        month_values = []
        for m in monthly_data:
            parts = m['date'].split('-')
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            month_idx = int(parts[1]) - 1
            label = f"{month_names[month_idx]} {parts[0][2:]}"
            month_labels.append(label)
            month_values.append(m['value'])

        ax.set_title('Monthly Averages', fontsize=12, fontweight='bold', color='#374151', pad=12)
        bars = ax.bar(month_labels, month_values, color=color, alpha=0.75, width=0.6,
                      edgecolor=color, linewidth=0.8)

        # Value labels on bars
        for bar, val in zip(bars, month_values):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.2,
                    f'{val:.1f}', ha='center', va='bottom', fontsize=7, color='#374151')

        # Average line
        avg = sum(month_values) / len(month_values)
        ax.axhline(y=avg, color='#9CA3AF', linestyle=':', linewidth=0.8, alpha=0.7)
        ax.text(len(month_values) - 0.5, avg, f' avg: {avg:.1f}', fontsize=7, color='#9CA3AF', va='bottom')

        ax.set_ylabel(ylabel, fontsize=10, color='#374151')
        ax.tick_params(axis='x', rotation=45, labelsize=8)
        ax.tick_params(axis='y', labelsize=8)
        ax.grid(axis='y', alpha=0.3)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

    elif show_monthly:
        ax = axes[chart_idx]
        ax.text(0.5, 0.5, 'No monthly data available', ha='center', va='center',
                fontsize=12, color='#9CA3AF', transform=ax.transAxes)
        ax.axis('off')

    # Footer
    fig.text(0.5, 0.02, "Dietitian's Assistant — Confidential", fontsize=8,
             color='#9CA3AF', ha='center')

    fig.tight_layout(rect=[0.02, 0.04, 0.98, 0.94])
    return fig