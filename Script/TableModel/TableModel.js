
/**
 *  TableModel.js v1.1
 *  From Rugal Tu
 *  Base on jQuery Library v3.5.1
 * */

class TableModel {

    constructor(_Url, _ColumnsOptions = [], _TableOptions = {}, _ShowElement = '', _ElementName = '#Tb') {

        this.Url = _Url;
        this._TableOptions = _TableOptions;
        this.ShowElement = _ShowElement == undefined || _ShowElement == '' ? '' : _ShowElement.includes('#') ? _ShowElement : `#${_ShowElement}`;
        this.Table;
        this.ElementName = _ElementName.includes('#') ? _ElementName : `#${_ElementName}`;
        this.MethodType = 'GET';
        this.IsSuccessDraw = true;
        this.SetData = undefined;

        this.Result = {};
        this.OnSuccess = function (Result) { };
        this.OnError = function (Error) { };
        this.OnComplete = function () { };
        this.SendData = {};
        this.ColumnsOptions = [];
        this.AjaxOption = () => { };

        this.ColumnsInit(_ColumnsOptions);
    }

    AjaxInit(SendData, MethodType, IsSuccessDraw = true) {
        if (this.Table == undefined)
            this.Ajax(SendData, MethodType, IsSuccessDraw);
    }
    Ajax(SendData, MethodType, IsSuccessDraw = true) {
        this.SendData = SendData;
        this.MethodType = MethodType ?? this.MethodType;
        this.IsSuccessDraw = IsSuccessDraw;

        if (this.Table == undefined)
            this.TableInit();
        else {
            this.Clear();
            this.Table.ajax.reload();
        }
        return this;
    }

    get TableOptions() { return this._TableOptions; }
    set TableOptions(_TableOptions) {
        $.extend(this._TableOptions, _TableOptions);
        this.InitOption();
    }
    get Table() { return this._Table; }
    set Table(SetTable) { this._Table = SetTable; }

    UpdateData(SetData) {
        this.SetData = SetData;
        if (this.Table == undefined)
            this.TableInit();
        if (this.IsSuccessDraw)
            this.TableDraw();
        return this;
    }
    TableDraw() {
        this.Table.clear();
        this.Table.rows.add(this.SetData).draw();
    }
    TableRecalc() {
        //if (this.SetData != undefined)
        //    this.Table.columns.adjust().responsive.recalc().rows().invalidate();
    }

    AddData(Datas) {
        if (typeof Datas === 'array')
            this.Table.rows.add(Datas);
        else
            this.Table.rows.add([Datas]);

        this.Table.draw();
        return this;
    }
    Clear() {
        this.Table.clear().draw();
        return this;
    }

    AjaxSuccess(Result) {
        this.UpdateData(Result);
        this?.OnSuccess();
        if (this.ShowElement != undefined && this.ShowElement != '')
            $(this.ShowElement).show();
    }
    AjaxError(Error) { this.OnError(Error); }
    AjaxComplete() { this.OnComplete(); }

    ColumnsInit(_ColumnsOptions) {
        this.ColumnsOptions = [];
        for (let ColIdx in _ColumnsOptions) {
            let Col = _ColumnsOptions[ColIdx];
            let AddCol = {};
            if (typeof Col === "string")
                AddCol = { data: this.ToFirstLower(Col), };

            if (typeof Col === "object")
                AddCol = Col;
            this.ColumnsOptions.push(AddCol);
        }
    }
    InitOption(_TableOptions) {
        let Caller = this;
        let SuccessFunc = this.AjaxSuccess;
        let ErrorFunc = this.AjaxError;
        let CompleteFunc = this.AjaxComplete;

        let GetData = () => {
            if (this.MethodType == 'POST')
                return JSON.stringify(this.SendData);

            let Params = [];
            for (let Key in this.SendData) {
                let Val = this.SendData[Key];
                Params.push(`${Key}=${Val}`);
            }
            let GetParam = Params.join('&');
            return GetParam;
        };
        let StaticOptions = {
            destroy: true,
            responsive: true,
            retrieve: true,
            autoWidth: false,
            ajax: {
                dataType: "JSON",
                contentType: 'application/json;charset=utf-8',
                url: this.Url,
                type: this.MethodType,
                data: GetData,
                success: function (Result) {
                    SuccessFunc?.call(Caller, Result);
                },
                error: function (Error) {
                    ErrorFunc?.call(Caller, Error);
                },
                complete: function () {
                    CompleteFunc?.call(Caller);
                },
            },
            columns: this.ColumnsOptions,
        };
        $.extend(StaticOptions, _TableOptions);
        $.extend(this.TableOptions, StaticOptions);
        if ("columns" in _TableOptions)
            this.ColumnsInit(_TableOptions["columns"]);
        $.extend(this._TableOptions, { "columns": this.ColumnsOptions });
    }

    TableInit(MethodType) {
        this.MethodType = MethodType ?? this.MethodType;
        this.InitOption(this._TableOptions);
        if (this.Table == undefined)
            this.Table = $(this.ElementName).DataTable(this.TableOptions);
        return this;
    }

    ToFirstLower(UpperString) {
        return UpperString;
        //let StartIdx = UpperString.length > 2 ? 1 : 0;
        //let EndIdx = UpperString.length > 2 ? UpperString.length : 1;
        //let LastString = UpperString.substring(StartIdx, EndIdx);

        //let UpperRet = `${UpperString[0].toLowerCase()}${LastString}`;
        //return UpperRet;
    }
}

/**
 *
 *  Important Update Record :
 *
 *  2021/12/02 Update by Rugal
 *  Updated the process of Update 'InitOption()'
 *
 * */