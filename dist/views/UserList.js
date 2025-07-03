"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@archbase/react");
const react_3 = require("@archbase/react");
const UserList = ({ data, loading = false, onRowClick }) => {
    const columns = [
        {
            key: 'id',
            title: 'Id',
            dataIndex: 'id',
            sorter: true,
            filterable: true,
        },
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
            filterable: true,
        },
        {
            key: 'email',
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            filterable: true,
        },
        {
            key: 'role',
            title: 'Role',
            dataIndex: 'role',
            sorter: true,
            filterable: true,
        },
    ];
    return (<div className="UserList">
      <div className="UserList__header">
        <h1>User - Lista</h1>
      </div>
      
      <react_3.ArchbaseFilterBuilder onFilterChange={(filters) => console.log('Filters:', filters)}/>
      
      <react_2.ArchbaseDataTable columns={columns} dataSource={data} loading={loading} onRow={(record) => ({
            onClick: () => onRowClick?.(record)
        })} pagination={{ pageSize: 20 }}/>
    </div>);
};
exports.default = UserList;
//# sourceMappingURL=UserList.js.map