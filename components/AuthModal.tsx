import React, { useState } from 'react';
import { Button, Input, Card } from './ui';
import { X, Building } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (phone: string, pass: string) => Promise<boolean>;
  onRegister: (data: any) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    password: '',
    building: '',
    unit: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await onLogin(phone, password);
      if (!success) {
        setError('手机号或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!regData.name || !regData.phone || !regData.password || !regData.building || !regData.unit) {
      setError('请填写所有必填项');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onRegister(regData);
      if (success) {
        setIsLogin(true);
        setError('');
        // Optional: show success message or auto-fill login
        setPhone(regData.phone);
        setPassword(regData.password);
        alert('注册成功！请使用新账号登录。');
      } else {
        setError('该手机号已被注册');
      }
    } catch (err) {
      setError('注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Building className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">华侨城智慧社区</h1>
            <p className="text-gray-500 mt-2">实名认证 · 业主自治 · 高效管理</p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              账号登录
            </button>
            <button
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${!isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              首次注册
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input 
                label="手机号码" 
                placeholder="请输入手机号码" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />
              <Input 
                label="登录密码" 
                type="password" 
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full h-11 text-base mt-2" type="submit" isLoading={isLoading}>
                立即登录
              </Button>
              <p className="text-xs text-center text-gray-400 mt-4">
                系统管理员默认账号: 18688835658
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input 
                label="业主姓名" 
                placeholder="请填写真实姓名" 
                value={regData.name}
                onChange={(e) => setRegData({...regData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="所属楼栋"
                  placeholder="例如: T4栋"
                  value={regData.building}
                  onChange={(e) => setRegData({...regData, building: e.target.value})}
                />
                <Input 
                  label="单元房号" 
                  placeholder="例如: 1单元501" 
                  value={regData.unit}
                  onChange={(e) => setRegData({...regData, unit: e.target.value})}
                />
              </div>
              <Input 
                label="手机号码" 
                type="tel"
                placeholder="作为登录账号" 
                value={regData.phone}
                onChange={(e) => setRegData({...regData, phone: e.target.value})}
              />
              <Input 
                label="设置密码" 
                type="password" 
                placeholder="6位以上字符" 
                value={regData.password}
                onChange={(e) => setRegData({...regData, password: e.target.value})}
              />
              <Button className="w-full h-11 text-base mt-2" type="submit" isLoading={isLoading}>
                提交注册
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};