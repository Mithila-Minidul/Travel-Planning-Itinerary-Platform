import React from 'react';
import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
const auth=vi.hoisted(()=>({register:vi.fn()}));
vi.mock('../../src/context/AuthContext',()=>({useAuth:()=>auth}));
import Register from '../../src/components/auth/Register';
describe('Register component',()=>{
it('renders registration screen and initial step',()=>{render(<MemoryRouter><Register/></MemoryRouter>);expect(document.body.textContent).toMatch(/register|create account|sign up/i);});
it('does not submit registration on initial empty form',()=>{render(<MemoryRouter><Register/></MemoryRouter>);expect(auth.register).not.toHaveBeenCalled();});
it('exposes a route back to login',()=>{render(<MemoryRouter><Register/></MemoryRouter>);expect(document.querySelector('a[href="/login"]')).not.toBeNull();});
});
