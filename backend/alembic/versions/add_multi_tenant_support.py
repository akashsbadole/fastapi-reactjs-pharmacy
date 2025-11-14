"""Add multi-tenant support

Revision ID: add_multi_tenant_support
Revises: 
Create Date: 2023-12-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_multi_tenant_support'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tenants table
    op.create_table('tenants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('domain', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'SUSPENDED', name='tenantstatus'), nullable=False),
        sa.Column('plan', sa.Enum('BASIC', 'PROFESSIONAL', 'ENTERPRISE', name='tenantplan'), nullable=False),
        sa.Column('max_users', sa.Integer(), nullable=True),
        sa.Column('max_pharmacies', sa.Integer(), nullable=True),
        sa.Column('storage_limit_gb', sa.Integer(), nullable=True),
        sa.Column('subscription_start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('subscription_end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('billing_email', sa.String(), nullable=True),
        sa.Column('billing_address', sa.Text(), nullable=True),
        sa.Column('contact_person', sa.String(), nullable=True),
        sa.Column('contact_email', sa.String(), nullable=True),
        sa.Column('contact_phone', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_tenants_domain'), 'tenants', ['domain'], unique=True)
    op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'], unique=False)

    # Create tenant_settings table
    op.create_table('tenant_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('settings_data', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create user_invitations table
    op.create_table('user_invitations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'PHARMACIST', 'CASHIER', 'DOCTOR', name='userrole'), nullable=False),
        sa.Column('invitation_token', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_accepted', sa.Boolean(), nullable=True),
        sa.Column('accepted_by', sa.Integer(), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['accepted_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Add tenant_id to all existing tables
    # Users table
    op.add_column('users', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_users_tenant_id', 'users', 'tenants', ['tenant_id'], ['id'])
    op.drop_constraint('uq_users_username', 'users', type_='unique')
    op.drop_constraint('uq_users_email', 'users', type_='unique')
    op.create_index('ix_users_tenant_username', 'users', ['tenant_id', 'username'], unique=True)
    op.create_index('ix_users_tenant_email', 'users', ['tenant_id', 'email'], unique=True)

    # Patients table
    op.add_column('patients', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_patients_tenant_id', 'patients', 'tenants', ['tenant_id'], ['id'])

    # Suppliers table
    op.add_column('suppliers', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_suppliers_tenant_id', 'suppliers', 'tenants', ['tenant_id'], ['id'])

    # Medicines table
    op.add_column('medicines', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_medicines_tenant_id', 'medicines', 'tenants', ['tenant_id'], ['id'])

    # Medicine batches table
    op.add_column('medicine_batches', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_medicine_batches_tenant_id', 'medicine_batches', 'tenants', ['tenant_id'], ['id'])

    # Stock movements table
    op.add_column('stock_movements', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_stock_movements_tenant_id', 'stock_movements', 'tenants', ['tenant_id'], ['id'])

    # Prescriptions table
    op.add_column('prescriptions', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_prescriptions_tenant_id', 'prescriptions', 'tenants', ['tenant_id'], ['id'])

    # Prescription items table
    op.add_column('prescription_items', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_prescription_items_tenant_id', 'prescription_items', 'tenants', ['tenant_id'], ['id'])

    # Invoices table
    op.add_column('invoices', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_invoices_tenant_id', 'invoices', 'tenants', ['tenant_id'], ['id'])

    # Invoice items table
    op.add_column('invoice_items', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_invoice_items_tenant_id', 'invoice_items', 'tenants', ['tenant_id'], ['id'])

    # Payments table
    op.add_column('payments', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_payments_tenant_id', 'payments', 'tenants', ['tenant_id'], ['id'])

    # Refunds table
    op.add_column('refunds', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_refunds_tenant_id', 'refunds', 'tenants', ['tenant_id'], ['id'])

    # Audit logs table
    op.add_column('audit_logs', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_audit_logs_tenant_id', 'audit_logs', 'tenants', ['tenant_id'], ['id'])

    # Notifications table
    op.add_column('notifications', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_notifications_tenant_id', 'notifications', 'tenants', ['tenant_id'], ['id'])

    # Hold bills table
    op.add_column('hold_bills', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_hold_bills_tenant_id', 'hold_bills', 'tenants', ['tenant_id'], ['id'])

    # Settings tables
    op.add_column('organization_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_organization_settings_tenant_id', 'organization_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('pos_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_pos_settings_tenant_id', 'pos_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('theme_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_theme_settings_tenant_id', 'theme_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('inventory_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_inventory_settings_tenant_id', 'inventory_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('notification_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_notification_settings_tenant_id', 'notification_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('integration_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_integration_settings_tenant_id', 'integration_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('compliance_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_compliance_settings_tenant_id', 'compliance_settings', 'tenants', ['tenant_id'], ['id'])

    # Support tables
    op.add_column('support_tickets', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_support_tickets_tenant_id', 'support_tickets', 'tenants', ['tenant_id'], ['id'])

    op.add_column('knowledge_base_articles', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_knowledge_base_articles_tenant_id', 'knowledge_base_articles', 'tenants', ['tenant_id'], ['id'])

    op.add_column('support_contacts', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_support_contacts_tenant_id', 'support_contacts', 'tenants', ['tenant_id'], ['id'])

    op.add_column('support_resources', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_support_resources_tenant_id', 'support_resources', 'tenants', ['tenant_id'], ['id'])

    # Subscription tables
    op.add_column('user_subscriptions', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_user_subscriptions_tenant_id', 'user_subscriptions', 'tenants', ['tenant_id'], ['id'])

    op.add_column('payment_methods', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_payment_methods_tenant_id', 'payment_methods', 'tenants', ['tenant_id'], ['id'])

    op.add_column('subscription_invoices', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_subscription_invoices_tenant_id', 'subscription_invoices', 'tenants', ['tenant_id'], ['id'])
    op.drop_constraint('uq_subscription_invoices_invoice_number', 'subscription_invoices', type_='unique')
    op.create_index('ix_subscription_invoices_tenant_invoice_number', 'subscription_invoices', ['tenant_id', 'invoice_number'], unique=True)

    op.add_column('subscription_payments', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_subscription_payments_tenant_id', 'subscription_payments', 'tenants', ['tenant_id'], ['id'])

    # Other settings tables
    op.add_column('backup_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_backup_settings_tenant_id', 'backup_settings', 'tenants', ['tenant_id'], ['id'])

    op.add_column('user_roles_settings', sa.Column('tenant_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_user_roles_settings_tenant_id', 'user_roles_settings', 'tenants', ['tenant_id'], ['id'])


def downgrade():
    # Remove tenant_id from all tables
    op.drop_constraint('fk_user_roles_settings_tenant_id', 'user_roles_settings', type_='foreignkey')
    op.drop_column('user_roles_settings', 'tenant_id')

    op.drop_constraint('fk_backup_settings_tenant_id', 'backup_settings', type_='foreignkey')
    op.drop_column('backup_settings', 'tenant_id')

    op.drop_constraint('fk_subscription_payments_tenant_id', 'subscription_payments', type_='foreignkey')
    op.drop_column('subscription_payments', 'tenant_id')

    op.drop_constraint('fk_subscription_invoices_tenant_id', 'subscription_invoices', type_='foreignkey')
    op.drop_index('ix_subscription_invoices_tenant_invoice_number', table_name='subscription_invoices')
    op.drop_column('subscription_invoices', 'tenant_id')

    op.drop_constraint('fk_payment_methods_tenant_id', 'payment_methods', type_='foreignkey')
    op.drop_column('payment_methods', 'tenant_id')

    op.drop_constraint('fk_user_subscriptions_tenant_id', 'user_subscriptions', type_='foreignkey')
    op.drop_column('user_subscriptions', 'tenant_id')

    op.drop_constraint('fk_support_resources_tenant_id', 'support_resources', type_='foreignkey')
    op.drop_column('support_resources', 'tenant_id')

    op.drop_constraint('fk_support_contacts_tenant_id', 'support_contacts', type_='foreignkey')
    op.drop_column('support_contacts', 'tenant_id')

    op.drop_constraint('fk_knowledge_base_articles_tenant_id', 'knowledge_base_articles', type_='foreignkey')
    op.drop_column('knowledge_base_articles', 'tenant_id')

    op.drop_constraint('fk_support_tickets_tenant_id', 'support_tickets', type_='foreignkey')
    op.drop_column('support_tickets', 'tenant_id')

    op.drop_constraint('fk_compliance_settings_tenant_id', 'compliance_settings', type_='foreignkey')
    op.drop_column('compliance_settings', 'tenant_id')

    op.drop_constraint('fk_integration_settings_tenant_id', 'integration_settings', type_='foreignkey')
    op.drop_column('integration_settings', 'tenant_id')

    op.drop_constraint('fk_notification_settings_tenant_id', 'notification_settings', type_='foreignkey')
    op.drop_column('notification_settings', 'tenant_id')

    op.drop_constraint('fk_inventory_settings_tenant_id', 'inventory_settings', type_='foreignkey')
    op.drop_column('inventory_settings', 'tenant_id')

    op.drop_constraint('fk_theme_settings_tenant_id', 'theme_settings', type_='foreignkey')
    op.drop_column('theme_settings', 'tenant_id')

    op.drop_constraint('fk_pos_settings_tenant_id', 'pos_settings', type_='foreignkey')
    op.drop_column('pos_settings', 'tenant_id')

    op.drop_constraint('fk_organization_settings_tenant_id', 'organization_settings', type_='foreignkey')
    op.drop_column('organization_settings', 'tenant_id')

    op.drop_constraint('fk_hold_bills_tenant_id', 'hold_bills', type_='foreignkey')
    op.drop_column('hold_bills', 'tenant_id')

    op.drop_constraint('fk_notifications_tenant_id', 'notifications', type_='foreignkey')
    op.drop_column('notifications', 'tenant_id')

    op.drop_constraint('fk_audit_logs_tenant_id', 'audit_logs', type_='foreignkey')
    op.drop_column('audit_logs', 'tenant_id')

    op.drop_constraint('fk_refunds_tenant_id', 'refunds', type_='foreignkey')
    op.drop_column('refunds', 'tenant_id')

    op.drop_constraint('fk_payments_tenant_id', 'payments', type_='foreignkey')
    op.drop_column('payments', 'tenant_id')

    op.drop_constraint('fk_invoice_items_tenant_id', 'invoice_items', type_='foreignkey')
    op.drop_column('invoice_items', 'tenant_id')

    op.drop_constraint('fk_invoices_tenant_id', 'invoices', type_='foreignkey')
    op.drop_column('invoices', 'tenant_id')

    op.drop_constraint('fk_prescription_items_tenant_id', 'prescription_items', type_='foreignkey')
    op.drop_column('prescription_items', 'tenant_id')

    op.drop_constraint('fk_prescriptions_tenant_id', 'prescriptions', type_='foreignkey')
    op.drop_column('prescriptions', 'tenant_id')

    op.drop_constraint('fk_stock_movements_tenant_id', 'stock_movements', type_='foreignkey')
    op.drop_column('stock_movements', 'tenant_id')

    op.drop_constraint('fk_medicine_batches_tenant_id', 'medicine_batches', type_='foreignkey')
    op.drop_column('medicine_batches', 'tenant_id')

    op.drop_constraint('fk_medicines_tenant_id', 'medicines', type_='foreignkey')
    op.drop_column('medicines', 'tenant_id')

    op.drop_constraint('fk_suppliers_tenant_id', 'suppliers', type_='foreignkey')
    op.drop_column('suppliers', 'tenant_id')

    op.drop_constraint('fk_patients_tenant_id', 'patients', type_='foreignkey')
    op.drop_column('patients', 'tenant_id')

    op.drop_constraint('fk_users_tenant_id', 'users', type_='foreignkey')
    op.drop_index('ix_users_tenant_email', table_name='users')
    op.drop_index('ix_users_tenant_username', table_name='users')
    op.create_unique_constraint('uq_users_email', 'users', ['email'])
    op.create_unique_constraint('uq_users_username', 'users', ['username'])
    op.drop_column('users', 'tenant_id')

    # Drop tenant tables
    op.drop_table('user_invitations')
    op.drop_table('tenant_settings')
    op.drop_index(op.f('ix_tenants_name'), table_name='tenants')
    op.drop_index(op.f('ix_tenants_domain'), table_name='tenants')
    op.drop_table('tenants')