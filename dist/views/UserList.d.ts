import React from 'react';
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}
interface UserListProps {
    data: User[];
    loading?: boolean;
    onRowClick?: (item: User) => void;
}
declare const UserList: React.FC<UserListProps>;
export default UserList;
//# sourceMappingURL=UserList.d.ts.map