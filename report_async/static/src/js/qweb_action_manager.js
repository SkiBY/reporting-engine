odoo.define('report_async.print', function(require) {
    'use strict';

    var ActionManager = require('web.ActionManager');
    var core = require('web.core');
    var framework = require('web.framework');
    var Model = require('web.Model');
    var Dialog = require('web.Dialog');

    var _t = core._t;
    var QWeb = core.qweb;

    ActionManager.include({
        ir_actions_report_xml: function(action, options) {
            var self = this;
            var _super = this._super;
            var _action = _.clone(action);
            var $content = $(QWeb.render("ReportAsyncConfiguration", {}));

            new Model('ir.actions.report.xml')
                .call('is_report_async', [_action.report_name])
                .then(function(result){
                    var records = _action.context.active_ids;
                    if (result.is_report_async && records.length >= result.no_of_records) {
                        // Popup for async Configuration
                        var asyncDialog = new Dialog(self, {
                            title: _t("Async Report Configuration ") + '(' + action['display_name'] + ')',
                            size : "medium",
                            buttons: [{
                                text: _t("Print"),
                                classes: 'btn-primary',
                                close: true,
                                click: function () {
                                    var is_report_async = this.$('#async_report_checker')
                                        .prop('checked');
                                    var user_email = this.$('#async-user-email').val();
                                    if (user_email !== '' && is_report_async) {
                                        // Try basic email validation
                                        if (self._validate_email(user_email)) {
                                            if ('report_type' in _action && _action.report_type === 'qweb-pdf') {
                                                framework.unblockUI();
                                                // Generate report async
                                                new Model('report.async').call('print_document_async',
                                                    [_action.context.active_ids, _action.report_name],
                                                    {
                                                        to_email: user_email,
                                                        data: _action.data || {},
                                                        context: _action.context || {},
                                                    }).then(function() {
                                                        self.do_notify(_t('Report'),
                                                            _t('Job started to generate report. Upon ' +
                                                                'completion, mail sent to:') +
                                                            user_email, true);
                                                    }).fail(function() {
                                                        self.do_notify(_t('Report'),
                                                            _t('Failed, error on job creation.'), true);
                                                    });
                                            }
                                            else {
                                                // default to normal approach to generate report
                                                return _super.apply(self, [action, options]);
                                            }
                                        }
                                    }
                                    else {
                                        // default to normal approach to generate report
                                        return _super.apply(self, [action, options]);
                                    }
                                }},
                                {
                                    text: _t("Discard"),
                                    close: true
                                }],
                            $content: $content,
                        }).open();
                        asyncDialog.$el.find("#async-user-email").val(
                            result.mail_recipient);
                    }
                    else {
                        // default to normal approach to generate report
                        return _super.apply(self, [action, options]);
                    }
                });
            },
        _validate_email: function (email) {
            var res = email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
            if (!res) {
                return this.do_notify(_("Email Validation Error"),
                    _("Please check your email syntax and try again"), true);
            }
            return true;
        }
    });
});
