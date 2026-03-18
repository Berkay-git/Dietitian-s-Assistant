from models.models import PhysicalDetails, ClientProgressSnapshot
from collections import defaultdict
from datetime import datetime


def _get_weight_raw(client_id):
    records = (
        PhysicalDetails.query
        .filter_by(ClientID=client_id)
        .filter(PhysicalDetails.Weight.isnot(None))
        .filter(PhysicalDetails.MeasurementDate.isnot(None))
        .order_by(PhysicalDetails.MeasurementDate.asc())
        .all()
    )
    return [{'date': r.MeasurementDate.isoformat(), 'value': float(r.Weight)} for r in records]


def _get_bodyfat_raw(client_id):
    records = (
        PhysicalDetails.query
        .filter_by(ClientID=client_id)
        .filter(PhysicalDetails.BodyFat.isnot(None))
        .filter(PhysicalDetails.MeasurementDate.isnot(None))
        .order_by(PhysicalDetails.MeasurementDate.asc())
        .all()
    )
    return [{'date': r.MeasurementDate.isoformat(), 'value': float(r.BodyFat)} for r in records]


def _get_adherence_raw(client_id):
    records = (
        ClientProgressSnapshot.query
        .filter_by(ClientID=client_id)
        .filter(ClientProgressSnapshot.AdherenceRate.isnot(None))
        .order_by(ClientProgressSnapshot.ProgressDate.asc())
        .all()
    )
    return [{'date': r.ProgressDate.isoformat(), 'value': float(r.AdherenceRate)} for r in records]


def _group_weekly(data):
    groups = defaultdict(list)
    for r in data:
        d = datetime.strptime(r['date'], '%Y-%m-%d')
        key = d.strftime('%G-W%V')
        groups[key].append(r['value'])
    return [{'date': k, 'value': round(sum(v) / len(v), 2)} for k, v in sorted(groups.items())]


def _group_monthly(data):
    groups = defaultdict(list)
    for r in data:
        d = datetime.strptime(r['date'], '%Y-%m-%d')
        key = d.strftime('%Y-%m')
        groups[key].append(r['value'])
    return [{'date': k, 'value': round(sum(v) / len(v), 2)} for k, v in sorted(groups.items())]


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

    if duration == 'weekly':
        data = _group_weekly(raw)
    elif duration == 'monthly':
        data = _group_monthly(raw)
    else:
        data = raw

    return True, 'Success', data
