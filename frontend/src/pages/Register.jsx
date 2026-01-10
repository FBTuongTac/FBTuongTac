import { useState } from 'react';
import { registerApi } from '../api/auth';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({});
    const [msg, setMsg] = useState('');

    const submit = async () => {
        try {
            await registerApi(form);
            setMsg('Đăng ký thành công – sang đăng nhập');
        } catch (e) {
            setMsg(e.response?.data?.msg || 'Lỗi');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h2>Đăng ký</h2>
                <input placeholder="Username"
                    onChange={e=>setForm({...form,username:e.target.value})}/>
                <input placeholder="Email"
                    onChange={e=>setForm({...form,email:e.target.value})}/>
                <input type="password" placeholder="Password"
                    onChange={e=>setForm({...form,password:e.target.value})}/>
                <button onClick={submit}>Đăng ký</button>
                <p>{msg}</p>
                <p><a href="/login">Quay lại đăng nhập</a></p>
            </div>
        </div>
    );
}
