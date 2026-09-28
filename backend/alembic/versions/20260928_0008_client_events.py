"""add client events API tables

Revision ID: 20260928_0008
Revises: 20260926_0007
"""
from typing import Sequence
from alembic import op
import sqlalchemy as sa

revision = "20260928_0008"
down_revision = "20260926_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

def upgrade() -> None:
    op.create_table("cities", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(255), nullable=False, unique=True))
    op.execute("INSERT INTO cities (name) VALUES ('Казань')")
    op.add_column("max_users", sa.Column("city_id", sa.Integer(), sa.ForeignKey("cities.id"), nullable=True))
    op.add_column("max_users", sa.Column("smart_interest_rotation", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("max_users", sa.Column("notify_event_reminders", sa.Boolean(), server_default=sa.text("true"), nullable=False))
    op.add_column("max_users", sa.Column("notify_schedule_changes", sa.Boolean(), server_default=sa.text("true"), nullable=False))
    op.create_table("events",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("city_id", sa.Integer(), sa.ForeignKey("cities.id"), nullable=False),
        sa.Column("category", sa.String(32), nullable=False), sa.Column("visible", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("address", sa.String(500), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False), sa.Column("longitude", sa.Float(), nullable=False), sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False), sa.Column("ends_at", sa.DateTime(timezone=True)),
        sa.Column("chat_invite_url", sa.String(2048)), sa.Column("chat_max_id", sa.BigInteger()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_events_starts_at", "events", ["starts_at"])
    op.create_check_constraint("ck_events_category", "events", "category IN ('event','place','volunteer','sport','park')")
    op.create_table("official_events", sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), primary_key=True), sa.Column("price_rub", sa.Integer(), nullable=False), sa.Column("pushkin_card", sa.Boolean(), nullable=False))
    op.create_table("user_events", sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), primary_key=True), sa.Column("author_user_id", sa.Integer(), sa.ForeignKey("max_users.id"), nullable=False))
    op.create_table("map_areas", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("city_id", sa.Integer(), sa.ForeignKey("cities.id"), nullable=False), sa.Column("kind", sa.String(32), nullable=False), sa.Column("name", sa.String(255), nullable=False), sa.Column("path", sa.JSON(), nullable=False), sa.Column("visible", sa.Boolean(), server_default=sa.text("true"), nullable=False))
    op.create_check_constraint("ck_map_areas_kind", "map_areas", "kind IN ('park','sport_ground')")
    op.create_table("event_areas", sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), primary_key=True), sa.Column("path", sa.JSON(), nullable=False))
    for table, time_col in (("event_attendances", "created_at"), ("event_views", "viewed_at")):
        op.create_table(table, sa.Column("user_id", sa.Integer(), sa.ForeignKey("max_users.id", ondelete="CASCADE"), primary_key=True), sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), primary_key=True), sa.Column(time_col, sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_table("event_reviews", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False), sa.Column("user_id", sa.Integer(), sa.ForeignKey("max_users.id", ondelete="CASCADE")), sa.Column("rating", sa.Integer(), nullable=False), sa.Column("text", sa.Text()), sa.Column("anonymous", sa.Boolean(), server_default=sa.text("false"), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("uq_event_reviews_event_user", "event_reviews", ["event_id", "user_id"], unique=True, postgresql_where=sa.text("user_id IS NOT NULL"))
    op.execute("CREATE UNIQUE INDEX uq_event_reviews_bot ON event_reviews(event_id) WHERE user_id IS NULL")
    op.execute("""CREATE OR REPLACE FUNCTION check_event_subtype() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (SELECT COUNT(*) FROM official_events WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)) + (SELECT COUNT(*) FROM user_events WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)) > 1 THEN RAISE EXCEPTION 'event has multiple subtypes'; END IF; RETURN NULL; END $$""")
    op.execute("CREATE CONSTRAINT TRIGGER event_subtype_official AFTER INSERT OR UPDATE OR DELETE ON official_events DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_event_subtype()")
    op.execute("CREATE CONSTRAINT TRIGGER event_subtype_user AFTER INSERT OR UPDATE OR DELETE ON user_events DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_event_subtype()")

def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS event_subtype_official ON official_events")
    op.execute("DROP TRIGGER IF EXISTS event_subtype_user ON user_events")
    op.execute("DROP FUNCTION IF EXISTS check_event_subtype()")
    for t in ("event_reviews", "event_views", "event_attendances", "event_areas", "map_areas", "user_events", "official_events"):
        op.drop_table(t)
    op.drop_index("ix_events_starts_at", table_name="events")
    op.drop_table("events")
    for c in ("notify_schedule_changes", "notify_event_reminders", "smart_interest_rotation", "city_id"): op.drop_column("max_users", c)
    op.drop_table("cities")
