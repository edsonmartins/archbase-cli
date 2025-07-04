"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_2 = require("archbase-react");
const UserCard = ({ name = 'Usuario', avatar, isOnline = false, }) => {
    return ((0, jsx_runtime_1.jsxs)(react_2.ArchbaseCard, { className: "UserCard", children: [(0, jsx_runtime_1.jsx)(react_2.ArchbaseText, { children: "name" }), (0, jsx_runtime_1.jsx)(react_2.ArchbaseText, { children: "avatar" })] }));
};
UserCard.defaultProps = {
    name: 'Usuario',
    isOnline: false
};
exports.default = UserCard;
//# sourceMappingURL=UserCard.js.map