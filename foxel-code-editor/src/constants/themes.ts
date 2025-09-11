import { CodeTheme } from '../types';

export const themes: CodeTheme[] = [
  {
    name: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    function: '#dcdcaa',
    variable: '#9cdcfe',
    type: '#4ec9b0',
    operator: '#d4d4d4',
    punctuation: '#d4d4d4'
  },
  {
    name: 'VS Code Light',
    background: '#ffffff',
    foreground: '#000000',
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    number: '#098658',
    function: '#795e26',
    variable: '#001080',
    type: '#267f99',
    operator: '#000000',
    punctuation: '#000000'
  },
  {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    function: '#a6e22e',
    variable: '#f8f8f2',
    type: '#66d9ef',
    operator: '#f8f8f2',
    punctuation: '#f8f8f2'
  },
  {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    number: '#d33682',
    function: '#b58900',
    variable: '#839496',
    type: '#268bd2',
    operator: '#839496',
    punctuation: '#839496'
  },
  {
    name: 'GitHub',
    background: '#ffffff',
    foreground: '#24292e',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    number: '#005cc5',
    function: '#6f42c1',
    variable: '#e36209',
    type: '#005cc5',
    operator: '#d73a49',
    punctuation: '#24292e'
  }
];