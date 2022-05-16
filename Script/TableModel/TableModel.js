
/**
 *  TableModel.js v1.5
 *  From Rugal Tu
 *  Base on jQuery Library v3.5.1
 * */

class TableModel {

    constructor(_Url, _DefaultOption = {}, _MethodType = 'POST', _ElementName = 'Tb', _ShowElement = '') {

        this.Url = _Url;

        this.DefaultOption = _DefaultOption;

        this.MethodType = _MethodType;
        this.ElementName = this.ToJQueryName(_ElementName);
        this.ShowElement = _ShowElement;
        this.Domain = undefined;
        this.IsSelectAll = false;

        this.AjaxFunc = undefined;
        this.SubmitFunc = undefined;
        this.Table = undefined;
        this.SendData = undefined;

        this.SelectRow = [];

        this.IsAutoColumn = false;

        this.InitOption();
    }

    // #region Init

    InitOption() {
        try {
            if (Domain != undefined && this.Domain == undefined)
                this.Domain = Domain;
        } catch { }

        let MethodType = this.MethodType;
        let UpdateFunc = this.UpdateData;
        let Caller = this;
        let GetData = function () {

            let ReturnData = this.SendData;

            if (MethodType == 'POST') {
                if (this.SendData == undefined)
                    ReturnData = JSON.stringify({});
                if (typeof this.SendData === 'object')
                    ReturnData = JSON.stringify(ReturnData);
            }
            return ReturnData;
        };

        this._DefaultAjax = {
            type: MethodType,
            url: this.ConvertToUrl(this.Url),
            data: function () {
                let SendData = GetData.call(Caller);
                return SendData;
            },
            dataSrc: '',
            dataType: 'JSON',
            contentType: 'application/json;charset=utf-8',
            success: function (Result) {
                UpdateFunc.call(Caller, Result);
            },
            error: function (error) {
                let aa = 1;
            }
        };

    }

    // #endregion

    // #region Class Property

    get DefaultAjax() {
        return this._DefaultAjax;
    }

    get Rows() {
        return this.Table?.rows().data().toArray();
    }

    get SelectData() {

        let GetRows = this.Rows;
        if (GetRows == undefined || GetRows.length == 0)
            return [];

        let ReturnData = [];
        for (let i = 0; i < GetRows.length; i++) {
            if (this.SelectRow.includes(i))
                ReturnData.push(GetRows[i]);
        }
        return ReturnData;
    }
    // #endregion


    // #region Add Setting Function

    Add_Domain(_Domain) {
        this.Domain = _Domain;
        return this;
    }

    Add_AutoColumn() {
        this.IsAutoColumn = true;
        return this;

    }

    Add_Option(OptionValue = {}) {
        let AllKey = Object.keys(OptionValue);
        for (let Idx in AllKey) {
            let Key = AllKey[Idx];
            let Val = OptionValue[Key];
            this.DefaultOption[Key] = Val;
        }
        return this;
    }

    Add_AjaxFunc(AjaxFunc) {
        this.AjaxFunc = AjaxFunc;
        return this;
    }

    Add_Columns(AddColumn) {

        let Cols = [];
        if (typeof AddColumn === 'object' && Array.isArray(AddColumn)) {
            for (let Idx in AddColumn) {
                let Item = AddColumn[Idx];
                Cols.push(this.ConvertToColumnParam(Item));
            }
        }
        else
            Cols.push(this.ConvertToColumnParam(AddColumn));

        let ColumnsOption = {
            'columns': Cols,
        };

        $.extend(this.DefaultOption, ColumnsOption);
        return this;
    }

    Add_Head(AddHead = []) {

        if (AddHead.length > 0) {
            let AttrList = ['thead', 'tr'];
            let FindAttr = this.RefactorElement(AttrList, 'td,th');

            for (let Idx in AddHead) {
                let Item = AddHead[Idx];
                FindAttr.append(`<th>${Item}</th>`);
            }
        }
        return this;
    }

    Add_HeadColumn(HeadColumn) {

        let AddColumns = [];
        let AddHeads = [];

        if (Array.isArray(HeadColumn)) {
            for (let Idx in HeadColumn) {
                let Item = HeadColumn[Idx];
                AddColumns.push(Item);
                AddHeads.push(Item);
            }
        } else {
            let AllKey = Object.keys(HeadColumn);
            for (let Idx in AllKey) {
                let Head = AllKey[Idx];
                let Col = HeadColumn[Head];
                AddColumns.push(Col);
                AddHeads.push(Head);
            }
        }

        this.Add_Head(AddHeads);
        this.Add_Columns(AddColumns);
        return this;
    }

    Add_RowSelect(ColIdx, CheckboxAttr = {}, Render = undefined) {

        let AllAttr = [];
        CheckboxAttr['type'] = 'checkbox';
        let AllKeys = Object.keys(CheckboxAttr);
        for (let Idx in AllKeys) {
            let Key = AllKeys[Idx];
            let AttrVal = CheckboxAttr[Key];
            AllAttr.push(`${Key}=${AttrVal}`);
        }
        let CheckboxClass = AllAttr.join(' ');
        let TableName = this.ToJQueryObject(this.ElementName)[0].id;
        let Caller = this;
        let OnChangeEvent = this.OnRowSelectChange;
        let GetIsSelectAll = () => this.IsSelectAll;
        let SelectRow = this.SelectRow;
        let SelectRender = {
            data: null,
            render: function (data, type, row, meta) {
                let ReturnRender = Render;
                ReturnRender ??= `@Checkbox`;
                let RowIdx = meta.row;
                let Id = `${TableName}_Select_${RowIdx}`;
                $(`#${Id}`).on('change', () => {
                    OnChangeEvent.call(Caller, Id, RowIdx);
                });

                let IsSelectAll = GetIsSelectAll();
                let SelectAllRender = IsSelectAll ? 'checked' : '';
                let ReplaceHtml = `<input id="${Id}" ${CheckboxClass} ${SelectAllRender}/>`;
                if (IsSelectAll && !SelectRow.includes(RowIdx))
                    SelectRow.push(RowIdx);

                ReturnRender = ReturnRender.replace('@Checkbox', ReplaceHtml);
                return ReturnRender;
            },
        };
        if (!'columns' in this.DefaultOption)
            this.DefaultOption.columns = [];
        this.DefaultOption.columns.splice(ColIdx, 0, SelectRender)
        return this;
    }

    Add_RowSelect_All(ObjectId) {
        let JObj = this.ToJQueryObject(ObjectId);
        JObj.on('change', () => {
            if (JObj.prop('checked'))
                this.SelectAll();
        });
        if (JObj.prop('checked')) {
            this.IsSelectAll = true;
            this.SelectAll();
        }

        return this;
    }

    // #endregion

    // #region Event Function

    OnRowSelectChange(Id, RowIdx) {
        let JObj = this.ToJQueryObject(Id);
        let IsChecked = JObj.prop('checked');

        let FindIdx = this.SelectRow.indexOf(RowIdx);
        if (IsChecked && FindIdx < 0) {
            this.SelectRow.push(RowIdx);
        }
        else if (!IsChecked && FindIdx > -1) {
            this.SelectRow.splice(FindIdx, 1);
        }
    }

    SelectAll() {
        let GetRow = this.Rows;
        if (GetRow != undefined && GetRow.length > 0)
            for (let i = 0; i < GetRow.length; i++)
                this.AddSelectRow(i);
    }

    // #endregion

    // #region Call Api
    Ajax(SendData = undefined) {

        if (SendData != undefined)
            this.SendData = SendData;

        if (this.AjaxFunc != undefined) {
            this.Clear();
            this.AjaxFunc?.call();
            return this;;
        }

        if (this.Table == undefined)
            this.TableInit(SendData);
        else
            this.Table.ajax.reload();
        return this;
    }
    // #endregion

    // #region DataTable Controll

    AddSelectRow(RowIdx) {
        if (!this.SelectRow.includes(RowIdx)) {
            this.SelectRow.push(RowIdx);
            let RowId = this.GetRowSelectDomId(RowIdx);
            let JObj = this.ToJQueryObject(RowId);
            JObj.prop('checked', true);
        }
    }

    Clear() {
        this.Table.clear().draw();
        return this;
    }

    UpdateData(AddData) {
        this.Clear();
        if (this.IsAutoColumn)
            this.RefactorAutoColumn(AddData);
        this.InsertData(AddData);
        return this;
    }

    InsertData(Data) {
        if (Array.isArray(Data))
            this.Table.rows.add(Data).draw().columns.adjust();
        else
            this.Table.row.add(Data).draw().columns.adjust();
    }

    InsertData_Distinct(Data, DistinctKey = []) {

        if (typeof DistinctKey === 'string')
            DistinctKey = [DistinctKey];

        if (!Array.isArray(Data))
            Data = [Data];

        let GetRows = this.Rows;
        for (let AddIdx in Data) {
            let Item = Data[AddIdx];
            let IsCanAdd = true;

            for (let RowIdx in GetRows) {
                let RowItem = GetRows[RowIdx];
                for (let DisIdx in DistinctKey) {
                    let DisKey = DistinctKey[DisIdx];
                    if (RowItem[DisKey] == Item[DisKey])
                        IsCanAdd = false;
                }
            }

            if (IsCanAdd)
                this.InsertData(Item);
        }
        return this;
    }

    RemoveData(RowIndex) {
        RowIndex = Number(RowIndex);
        this.Table.row(RowIndex).remove().draw();
    }

    TableInit(SendData) {

        this.SendData = SendData;
        this.RefactorElement([], 'tbody');
        let GetOptions = this.DefaultOption;
        if (Object.keys(GetOptions).length == 0) {
            this.Table = $(this.ElementName).DataTable();
        } else {
            if (this.IsNotNullAndEmpty(this.Url))
                GetOptions.ajax = this.DefaultAjax;
            this.Table = $(this.ElementName).DataTable(GetOptions);
        }
        return this;
    }

    FindElement(ElementType = []) {
        let FindAttr = $(this.ElementName);
        for (let Idx in ElementType) {

            let Item = ElementType[Idx];
            if (!FindAttr.children(Item).length > 0)
                FindAttr.prepend(`<${Item}></${Item}>`);

            FindAttr = FindAttr.children(Item);
        }

        return FindAttr;
    }

    RefactorElement(ElementType = [], ClearElement) {

        let FindAttr = this.FindElement(ElementType);

        let AllClearElement = ClearElement.split(',');
        for (let Idx in AllClearElement) {
            let Item = AllClearElement[Idx];
            FindAttr.children(Item).remove();
        }

        return FindAttr;
    }

    RefactorAutoColumn(Data) {

        Data = Array.isArray(Data) ? Data[0] : Data;
        let AllKey = Object.keys(Data);

        let FindAttr = this.RefactorElement();
        this.Add_Columns(AllKey);


    }

    // #endregion

    // #region Convert And Check

    GetRowSelectDomId(RowIdx) {
        let TableName = this.ToJQueryObject(this.ElementName)[0].id;
        let RowId = `${TableName}_Select_${RowIdx}`;
        return RowId;
    }

    GetRowsFromColumn(ColumnKey) {
        let Ret = [];
        for (let Idx in this.Rows) {
            let Item = this.Rows[Idx];
            Ret.push(Item[ColumnKey]);
        }
        return Ret;
    }

    ConvertToColumnParam(Column) {
        if (typeof Column === 'string') {
            return {
                data: Column
            };
        }
        else if (typeof Column === 'function') {
            return {
                data: null,
                render: Column,
            }
        }
        return Column;
    }

    ToJQueryName(ObjectId, IsUseIdFormat = true) {
        if (ObjectId == undefined)
            return ObjectId;

        if (ObjectId.includes('#') || ObjectId.includes('[') || ObjectId.includes(']') || ObjectId.includes('='))
            return ObjectId;

        if (IsUseIdFormat)
            return `[id='${ObjectId}']`;

        return `#${ObjectId}`;
    }

    ToJQueryObject(ObjectId, IsUseIdFormat = true) {
        return $(this.ToJQueryName(ObjectId, IsUseIdFormat));
    }


    IsNotNullAndEmpty(AssignString) {
        if (AssignString == undefined || AssignString == null)
            return false;
        AssignString = AssignString.replaceAll(' ', '');
        if (AssignString != undefined && AssignString != '')
            return true;
        return false;
    }
    ConvertToUrl(SendUrl) {
        if (this.Domain != undefined) {
            if (this.Domain[this.Domain.length - 1] != '/')
                this.Domain += '/';
            SendUrl = `${this.Domain}${SendUrl}`;
        }
        return SendUrl;
    }


    // #endregion
}