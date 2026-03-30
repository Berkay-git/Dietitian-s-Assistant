from db_config import db
from models.models import ClientProgressSnapshot
from datetime import date


def update_adherence_rate(client_id, is_followed):
    today = date.today()

    # Check if a snapshot already exists for today
    snapshot = (
        ClientProgressSnapshot.query
        .filter_by(ClientID=client_id, ProgressDate=today)
        .first()
    )

    if snapshot:
        # Update today's existing snapshot (If any mistake happened, we can update it here)
        if is_followed:
            snapshot.SuccessAmount = float(snapshot.SuccessAmount or 0) + 1
        snapshot.Total = float(snapshot.Total or 0) + 1
        snapshot.AdherenceRate = (float(snapshot.SuccessAmount) / float(snapshot.Total)) * 100
    else:
        # Get the latest snapshot to carry over cumulative totals
        latest = (
            ClientProgressSnapshot.query
            .filter_by(ClientID=client_id)
            .order_by(ClientProgressSnapshot.ProgressDate.desc())
            .first()
        )

        prev_success = float(latest.SuccessAmount or 0) if latest else 0
        prev_total = float(latest.Total or 0) if latest else 0

        new_success = prev_success + (1 if is_followed else 0)
        new_total = prev_total + 1
        new_rate = (new_success / new_total) * 100

        snapshot = ClientProgressSnapshot(
            ClientID=client_id,
            SuccessAmount=new_success,
            Total=new_total,
            AdherenceRate=round(new_rate, 2),
            ProgressDate=today,
        )
        db.session.add(snapshot)

    db.session.commit()