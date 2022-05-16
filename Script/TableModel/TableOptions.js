
//基底Option設定
//此為設定物件
//可因應專案需求更改基底物件
//並針對各模板 extends 繼承
class BaseTableOption {
    constructor(ControllerName, AjaxAction, UrlParam = undefined) {
        this.ControllerName = ControllerName;
        this.AjaxAction = AjaxAction;
        this.UrlParam = UrlParam;

        let SendUrl = this.AjaxAction;
        if (this.UrlParam != undefined)
            SendUrl = `${this.AjaxAction}?${UrlParam}`;
        if (this.ControllerName != undefined && this.ControllerName != '')
            SendUrl = `${ControllerName}/${SendUrl}`;
        this.AjaxUrl = SendUrl;

        this.OptionResult = {
            paging: false,
            ordering: false,
            info: false,
            searching: false,
            lengthChange: false,
            rowCallback: function (row, data, index) {
                this.api().row(':last').nodes().to$().addClass('last-row table-primary');
            },
        };
    }

    ToFirstLower(UpperString) {
        let StartIdx = UpperString.length > 2 ? 1 : 0;
        let EndIdx = UpperString.length > 2 ? UpperString.length : 1;
        let LastString = UpperString.substring(StartIdx, EndIdx);

        let UpperRet = `${UpperString[0].toLowerCase()}${LastString}`;
        return UpperRet;
    }

    AddOption(Option) {
        $.extend(this.OptionResult, Option);
    }
}