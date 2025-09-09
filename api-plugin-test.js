#!/usr/bin/env node

/**
 * Foxel API 插件测试脚本
 * 用于通过 API 测试插件加载和调试
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

class FoxelAPITester {
    constructor(baseUrl = 'http://10.0.0.8:3737') {
        this.baseUrl = baseUrl;
        this.authToken = null;
        this.isHttps = baseUrl.startsWith('https');
    }

    async makeRequest(endpoint, options = {}) {
        const url = new URL(endpoint, this.baseUrl);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const requestOptions = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (this.authToken) {
            requestOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return new Promise((resolve, reject) => {
            const req = client.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve({
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            headers: res.headers,
                            data: parsedData
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            headers: res.headers,
                            data: data
                        });
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async testConnection() {
        console.log('🔍 测试 API 连接...');
        try {
            const response = await this.makeRequest('/api/system/health');
            if (response.status === 200) {
                console.log('✅ API 连接成功');
                return true;
            } else {
                console.log(`❌ API 连接失败: ${response.status} ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ API 连接错误: ${error.message}`);
            return false;
        }
    }

    async login(username, password) {
        console.log('🔐 尝试登录...');
        try {
            const response = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: { username, password }
            });

            if (response.status === 200) {
                this.authToken = response.data.token || response.data.access_token;
                console.log('✅ 登录成功');
                return true;
            } else {
                console.log(`❌ 登录失败: ${response.status} ${response.statusText}`);
                console.log('响应:', response.data);
                return false;
            }
        } catch (error) {
            console.log(`❌ 登录错误: ${error.message}`);
            return false;
        }
    }

    async getSystemInfo() {
        console.log('📊 获取系统信息...');
        try {
            const response = await this.makeRequest('/api/system/info');
            if (response.status === 200) {
                console.log('✅ 系统信息获取成功:');
                console.log(JSON.stringify(response.data, null, 2));
                return response.data;
            } else {
                console.log(`❌ 获取系统信息失败: ${response.status} ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.log(`❌ 获取系统信息错误: ${error.message}`);
            return null;
        }
    }

    async listPlugins() {
        console.log('📋 获取插件列表...');
        try {
            const response = await this.makeRequest('/api/plugins');
            if (response.status === 200) {
                console.log(`✅ 找到 ${response.data.length || 0} 个插件:`);
                if (response.data.length > 0) {
                    response.data.forEach((plugin, index) => {
                        console.log(`  ${index + 1}. ${plugin.name || plugin.key} (${plugin.version || 'unknown'})`);
                    });
                }
                return response.data;
            } else {
                console.log(`❌ 获取插件列表失败: ${response.status} ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.log(`❌ 获取插件列表错误: ${error.message}`);
            return null;
        }
    }

    async loadPlugin(pluginUrl, pluginName) {
        console.log(`🔌 加载插件: ${pluginName} from ${pluginUrl}`);
        try {
            const response = await this.makeRequest('/api/plugins/load', {
                method: 'POST',
                body: {
                    url: pluginUrl,
                    name: pluginName
                }
            });

            if (response.status === 200 || response.status === 201) {
                console.log('✅ 插件加载成功');
                console.log('响应:', JSON.stringify(response.data, null, 2));
                return true;
            } else {
                console.log(`❌ 插件加载失败: ${response.status} ${response.statusText}`);
                console.log('响应:', JSON.stringify(response.data, null, 2));
                return false;
            }
        } catch (error) {
            console.log(`❌ 插件加载错误: ${error.message}`);
            return false;
        }
    }

    async getPluginStatus() {
        console.log('📊 获取插件状态...');
        try {
            const response = await this.makeRequest('/api/plugins/status');
            if (response.status === 200) {
                console.log('✅ 插件状态获取成功:');
                console.log(JSON.stringify(response.data, null, 2));
                return response.data;
            } else {
                console.log(`❌ 获取插件状态失败: ${response.status} ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.log(`❌ 获取插件状态错误: ${error.message}`);
            return null;
        }
    }

    async unloadPlugin(pluginName) {
        console.log(`🗑️ 卸载插件: ${pluginName}`);
        try {
            const response = await this.makeRequest('/api/plugins/unload', {
                method: 'POST',
                body: { name: pluginName }
            });

            if (response.status === 200) {
                console.log('✅ 插件卸载成功');
                return true;
            } else {
                console.log(`❌ 插件卸载失败: ${response.status} ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ 插件卸载错误: ${error.message}`);
            return false;
        }
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('🚀 Foxel API 插件测试工具');
    console.log('============================');

    // 获取配置
    const baseUrl = await question('API 基础 URL (默认: http://10.0.0.8:3737): ') || 'http://10.0.0.8:3737';
    const username = await question('用户名: ');
    const password = await question('密码: ');

    const tester = new FoxelAPITester(baseUrl);

    try {
        // 测试连接
        const connected = await tester.testConnection();
        if (!connected) {
            console.log('❌ 无法连接到 API，请检查 URL 和网络连接');
            process.exit(1);
        }

        // 登录
        const loggedIn = await tester.login(username, password);
        if (!loggedIn) {
            console.log('❌ 登录失败，请检查用户名和密码');
            process.exit(1);
        }

        // 获取系统信息
        await tester.getSystemInfo();

        // 获取现有插件列表
        await tester.listPlugins();

        // 测试加载插件
        const pluginUrl = 'https://github.com/maxage/foxel-plus/raw/main/foxel-image-viewer.js';
        const pluginName = 'foxel-image-viewer';
        
        console.log('\n🧪 开始测试插件加载...');
        const loadSuccess = await tester.loadPlugin(pluginUrl, pluginName);
        
        if (loadSuccess) {
            // 获取更新后的插件列表
            await tester.listPlugins();
            
            // 获取插件状态
            await tester.getPluginStatus();
        }

        console.log('\n✅ 测试完成');

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    } finally {
        rl.close();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FoxelAPITester;
