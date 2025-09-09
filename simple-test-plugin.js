// 简单的测试插件
(function() {
    console.log('🔍 简单测试插件开始加载...');
    
    // 检查环境
    if (typeof window === 'undefined') {
        console.error('❌ window 对象未定义');
        return;
    }
    
    console.log('✅ window 对象存在');
    
    // 检查 FoxelRegister
    if (typeof window.FoxelRegister !== 'function') {
        console.warn('⚠️ FoxelRegister 函数不存在，尝试延迟注册...');
        
        // 延迟注册
        setTimeout(function() {
            if (typeof window.FoxelRegister === 'function') {
                registerPlugin();
            } else {
                console.error('❌ 延迟注册失败，FoxelRegister 仍然不存在');
            }
        }, 1000);
        return;
    }
    
    registerPlugin();
    
    function registerPlugin() {
        console.log('🚀 开始注册简单测试插件...');
        
        const plugin = {
            key: 'com.foxel-plus.simple-test',
            name: '简单测试插件',
            version: '1.0.0',
            description: '一个简单的测试插件',
            author: 'Foxel Plus Team',
            supportedExts: ['txt'],
            defaultBounds: { x: 100, y: 100, width: 400, height: 300 },
            defaultMaximized: false,
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNDQ0Ii8+Cjx0ZXh0IHg9IjEyIiB5PSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxMiI+VDwvdGV4dD4KPC9zdmc+',
            mount: function(container, ctx) {
                console.log('📦 简单测试插件挂载中...', { container, ctx });
                try {
                    container.innerHTML = `
                        <div style="padding: 20px; background: #2a2a2a; color: #fff; font-family: Arial, sans-serif;">
                            <h3>🧪 简单测试插件</h3>
                            <p>这是一个简单的测试插件，用于验证 Foxel 插件系统是否正常工作。</p>
                            <p><strong>文件路径:</strong> ${ctx.filePath || '未知'}</p>
                            <p><strong>文件名:</strong> ${ctx.entry?.name || '未知'}</p>
                            <button onclick="this.parentElement.parentElement.innerHTML='<div style=\\"padding: 20px; color: #4caf50;\\">✅ 插件卸载成功！</div>'" 
                                    style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                卸载插件
                            </button>
                        </div>
                    `;
                    console.log('✅ 简单测试插件挂载成功');
                } catch (error) {
                    console.error('❌ 简单测试插件挂载失败:', error);
                    container.innerHTML = '<div style="padding: 20px; color: #ff6b6b;">插件挂载失败</div>';
                }
            },
            unmount: function(container) {
                console.log('🗑️ 简单测试插件卸载中...', { container });
                try {
                    container.innerHTML = '';
                    console.log('✅ 简单测试插件卸载成功');
                } catch (error) {
                    console.error('❌ 简单测试插件卸载失败:', error);
                }
            }
        };
        
        try {
            window.FoxelRegister(plugin);
            console.log('🎉 简单测试插件注册成功！');
        } catch (error) {
            console.error('❌ 简单测试插件注册失败:', error);
        }
    }
})();
