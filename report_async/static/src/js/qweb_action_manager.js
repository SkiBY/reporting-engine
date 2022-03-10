odoo.define('report_async.print', function(require) {
    'use strict';

    var ActionManager = require('web.ActionManager');
    var core = require('web.core');
    var framework = require('web.framework');
    var Model = require('web.Model');

    ActionManager.include({
        ir_actions_report_xml: function(action, options) {
            var _action = _.clone(action);
            var _t = core._t;
            var self = this;
            var _super = this._super;

            if ('report_type' in _action && _action.report_type === 'qweb-pdf') {
                framework.blockUI();
                new Model('ir.actions.report.xml')
                    .call('is_report_async', [_action.report_name])
                    .then(function(result){
                        if (result.is_report_async) {
                            framework.unblockUI();
                            new Model('report.async')
                                .call('print_document_async',
                                      [_action.context.active_ids,
                                       _action.report_name,
                                       ],
                                      {data: _action.data || {},
                                       context: _action.context || {},
                                       })
                                .then(function(){
                                    self.do_notify(_t('Report'),
                                                   _t('Job started to generate report. Upon completion, mail sent to:') + result.mail_recipient);
                                }).fail(function() {
                                    self.do_notify(_t('Report'),
                                                   _t('Failed, error on job creation.'));

                                });
                        } else {
                            return _super.apply(self, [_action, options]);
                        }
                    });
            } else {
                return _super.apply(self, [_action, options]);
            }
        }
    });
});
