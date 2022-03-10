# -*- coding: utf-8 -*-
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api


class IrActionsReportXml(models.Model):
    """
    Reports
    """

    _inherit = 'ir.actions.report.xml'

    async_report = fields.Boolean(default=False)

    @api.model
    def is_report_async(self, report_name):
        """ Returns True if the report is an async report

        Called from js
        """
        report_obj = self.env['report']
        report = report_obj._get_report_from_name(report_name)
        result = {'is_report_async': False}
        if not report:
            return result
        return {
            'is_report_async': report.async_report,
            'mail_recipient': self.env.user.email
        }
