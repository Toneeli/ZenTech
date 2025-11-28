import React, { useState } from 'react';
import { User, UserStatus } from '../types';
import { Button, Card, Badge } from './ui';
import { Check, X, User as UserIcon, Building2, Trash2 } from 'lucide-react';

interface BuildingAdminDashboardProps {
  adminBuilding: string;
  users: User[];
  onVerifyUser: (userId: string, isApproved: boolean) => void;
  onRemoveUser: (userId: string) => void;
}

export const BuildingAdminDashboard: React.FC<BuildingAdminDashboardProps> = ({ 
  adminBuilding, 
  users, 
  onVerifyUser,
  onRemoveUser 
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');

  // Filter for users in this admin's building
  const buildingUsers = users.filter(u => u.building === adminBuilding);
  const pendingUsers = buildingUsers.filter(u => u.status === UserStatus.PENDING);
  const verifiedUsers = buildingUsers.filter(u => u.status === UserStatus.VERIFIED);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <h3 className="text-lg font-medium opacity-90">负责楼栋</h3>
          <p className="text-3xl font-bold mt-2">{adminBuilding}</p>
        </Card>
        <Card className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${activeTab === 'pending' ? 'ring-2 ring-indigo-500' : ''}`} onClick={() => setActiveTab('pending')}>
          <h3 className="text-gray-500 text-sm font-medium">待审核申请</h3>
          <div className="flex items-end gap-2">
             <p className="text-3xl font-bold text-gray-900 mt-2">{pendingUsers.length}</p>
             {pendingUsers.length > 0 && <span className="mb-1 text-xs text-red-500 font-bold">需处理</span>}
          </div>
        </Card>
        <Card className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${activeTab === 'verified' ? 'ring-2 ring-indigo-500' : ''}`} onClick={() => setActiveTab('verified')}>
          <h3 className="text-gray-500 text-sm font-medium">已认证住户</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{verifiedUsers.length}</p>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
           {activeTab === 'pending' ? '新住户身份审核' : '住户档案管理'}
        </h2>
      </div>

      {activeTab === 'pending' && (
        <>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Check className="mx-auto h-12 w-12 text-green-400" />
              <p className="mt-2 text-gray-500">当前没有待审核的住户。</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map(user => (
                <Card key={user.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="h-4 w-4" />
                        <span>单元号: {user.unit}</span>
                        <span className="text-gray-300">|</span>
                        <span>手机: {user.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                     <Button variant="outline" className="flex-1 md:flex-none border-red-200 text-red-700 hover:bg-red-50" onClick={() => onVerifyUser(user.id, false)}>
                       <X className="mr-2 h-4 w-4" />
                       驳回
                     </Button>
                     <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700" onClick={() => onVerifyUser(user.id, true)}>
                       <Check className="mr-2 h-4 w-4" />
                       确认身份
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'verified' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">房间号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业主姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verifiedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => {
                         if(window.confirm(`确定要注销业主 ${user.name} 的信息吗？此操作不可撤销。`)) {
                           onRemoveUser(user.id);
                         }
                       }}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          注销信息
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {verifiedUsers.length === 0 && (
               <div className="p-8 text-center text-gray-500 text-sm">暂无已认证住户</div>
            )}
        </div>
      )}
    </div>
  );
};