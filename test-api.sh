#!/bin/bash

# Foxel API 快速测试脚本
# 用于测试 API 连接和插件加载

set -e

# 配置
API_BASE_URL="http://10.0.0.8:3737"
USERNAME=""
PASSWORD=""
PLUGIN_URL="https://github.com/maxage/foxel-plus/raw/main/foxel-image-viewer.js"
PLUGIN_NAME="foxel-image-viewer"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v curl &> /dev/null; then
        print_error "curl 未安装，请先安装 curl"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq 未安装，JSON 输出将不可读"
    fi
    
    print_success "依赖检查完成"
}

# 测试 API 连接
test_connection() {
    print_info "测试 API 连接..."
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE_URL/api/system/health" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        print_success "API 连接成功"
        return 0
    else
        print_error "API 连接失败 (HTTP $response)"
        return 1
    fi
}

# 用户登录
login() {
    if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
        print_info "请输入登录信息:"
        read -p "用户名: " USERNAME
        read -s -p "密码: " PASSWORD
        echo
    fi
    
    print_info "尝试登录..."
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
        "$API_BASE_URL/api/auth/login" 2>/dev/null)
    
    if echo "$response" | grep -q "token\|access_token"; then
        print_success "登录成功"
        # 提取 token
        if command -v jq &> /dev/null; then
            AUTH_TOKEN=$(echo "$response" | jq -r '.token // .access_token // empty')
        else
            AUTH_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        fi
        return 0
    else
        print_error "登录失败"
        echo "响应: $response"
        return 1
    fi
}

# 获取系统信息
get_system_info() {
    print_info "获取系统信息..."
    
    local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$API_BASE_URL/api/system/info" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "系统信息获取成功"
        if command -v jq &> /dev/null; then
            echo "$response" | jq .
        else
            echo "$response"
        fi
    else
        print_error "获取系统信息失败"
    fi
}

# 获取插件列表
list_plugins() {
    print_info "获取插件列表..."
    
    local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$API_BASE_URL/api/plugins" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "插件列表获取成功"
        if command -v jq &> /dev/null; then
            local count=$(echo "$response" | jq '. | length')
            echo "找到 $count 个插件:"
            echo "$response" | jq -r '.[] | "  - \(.name // .key) (\(.version // "unknown"))"'
        else
            echo "$response"
        fi
    else
        print_error "获取插件列表失败"
    fi
}

# 加载插件
load_plugin() {
    print_info "加载插件: $PLUGIN_NAME"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{\"url\":\"$PLUGIN_URL\",\"name\":\"$PLUGIN_NAME\"}" \
        "$API_BASE_URL/api/plugins/load" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "插件加载请求已发送"
        if command -v jq &> /dev/null; then
            echo "$response" | jq .
        else
            echo "$response"
        fi
    else
        print_error "插件加载失败"
    fi
}

# 获取插件状态
get_plugin_status() {
    print_info "获取插件状态..."
    
    local response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
        "$API_BASE_URL/api/plugins/status" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "插件状态获取成功"
        if command -v jq &> /dev/null; then
            echo "$response" | jq .
        else
            echo "$response"
        fi
    else
        print_error "获取插件状态失败"
    fi
}

# 卸载插件
unload_plugin() {
    print_info "卸载插件: $PLUGIN_NAME"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{\"name\":\"$PLUGIN_NAME\"}" \
        "$API_BASE_URL/api/plugins/unload" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "插件卸载请求已发送"
        if command -v jq &> /dev/null; then
            echo "$response" | jq .
        else
            echo "$response"
        fi
    else
        print_error "插件卸载失败"
    fi
}

# 主函数
main() {
    echo "🚀 Foxel API 快速测试工具"
    echo "=========================="
    
    # 检查依赖
    check_dependencies
    
    # 测试连接
    if ! test_connection; then
        exit 1
    fi
    
    # 登录
    if ! login; then
        exit 1
    fi
    
    # 获取系统信息
    get_system_info
    echo
    
    # 获取现有插件列表
    list_plugins
    echo
    
    # 加载插件
    load_plugin
    echo
    
    # 等待一下
    print_info "等待 2 秒..."
    sleep 2
    
    # 获取更新后的插件列表
    list_plugins
    echo
    
    # 获取插件状态
    get_plugin_status
    echo
    
    print_success "测试完成！"
    
    # 询问是否卸载插件
    read -p "是否卸载测试插件? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        unload_plugin
    fi
}

# 显示帮助信息
show_help() {
    echo "Foxel API 快速测试脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -u, --url URL  设置 API 基础 URL (默认: http://10.0.0.8:3737)"
    echo "  -n, --name NAME 设置插件名称 (默认: foxel-image-viewer)"
    echo "  -p, --plugin URL 设置插件 URL"
    echo ""
    echo "示例:"
    echo "  $0"
    echo "  $0 -u http://localhost:3737"
    echo "  $0 -n my-plugin -p https://example.com/plugin.js"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--url)
            API_BASE_URL="$2"
            shift 2
            ;;
        -n|--name)
            PLUGIN_NAME="$2"
            shift 2
            ;;
        -p|--plugin)
            PLUGIN_URL="$2"
            shift 2
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 运行主函数
main
