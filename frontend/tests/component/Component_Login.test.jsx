import React from 'react';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
const mock=vi.hoisted(()=>({login:vi.fn()}));
vi.mock('../../src/context/AuthContext',()=>({useAuth:()=>({login:mock.login})}));
import Login from '../../src/components/auth/Login';
const view=()=>render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<Login/>}/><Route path="/dashboard" element={<div>Dashboard destination</div>}/></Routes></MemoryRouter>);
const submit=(email,password)=>{const fields=screen.getAllByRole('textbox');fireEvent.change(fields[0],{target:{value:email}});fireEvent.change(document.querySelector('input[type=password]'),{target:{value:password}});fireEvent.click(screen.getByRole('button',{name:'Login'}));};
describe('Login component',()=>{beforeEach(()=>mock.login.mockReset());
it('renders required email and password fields',()=>{view();expect(document.querySelector('input[type=email]').required).toBe(true);expect(document.querySelector('input[type=password]').required).toBe(true);});
it('blocks empty browser-validity submission',()=>{view();fireEvent.click(screen.getByRole('button',{name:'Login'}));expect(mock.login).not.toHaveBeenCalled();});
it('submits credentials and navigates on success',async()=>{mock.login.mockResolvedValue({success:true});view();submit('a@b.com','pass123');await waitFor(()=>expect(mock.login).toHaveBeenCalledWith('a@b.com','pass123'));expect(await screen.findByText('Dashboard destination')).toBeTruthy();});
it('shows authentication error without navigating',async()=>{mock.login.mockResolvedValue({success:false,error:'Invalid credentials'});view();submit('a@b.com','badpass');expect(await screen.findByText('Invalid credentials')).toBeTruthy();});
it('shows fallback error if backend supplies no message',async()=>{mock.login.mockResolvedValue({success:false});view();submit('a@b.com','badpass');expect(await screen.findByText('Invalid email or password. Please try again.')).toBeTruthy();});
it('disables button during pending authentication', async () => {
        let resolveLogin;
        const pendingLogin = new Promise((resolve) => { resolveLogin = resolve; });
        mock.login.mockReturnValue(pendingLogin);

        view();
        submit('a@b.com', 'pass123');

        expect(mock.login).toHaveBeenCalledWith('a@b.com', 'pass123');
        expect(screen.getByRole('button', { name: 'Logging in...' }).disabled).toBe(true);

        await act(async () => {
            resolveLogin({ success: false, error: 'Invalid credentials' });
            await pendingLogin;
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Login' }).disabled).toBe(false);
        });
        expect(await screen.findByText('Invalid credentials')).toBeTruthy();
    });
});
