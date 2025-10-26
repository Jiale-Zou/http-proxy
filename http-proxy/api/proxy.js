export default async function handler(request, response) {
  // 设置CORS，允许您的GitHub Pages域名访问
  // 请将下面的网址替换为您的实际GitHub Pages地址
  response.setHeader('Access-Control-Allow-Origin', 'https://jiale-zou.github.io');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求（OPTIONS）
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  try {
    // 获取要代理的目标URL
    const { target } = request.query;
    
    if (!target) {
      return response.status(400).json({ 
        error: '缺少target参数。使用方法: /api/proxy?target=您的API地址' 
      });
    }
    
    // 安全验证：只允许代理特定域名
    const allowedDomains = ['kdc268f4.natappfree.cc']; // 修改为您需要的域名
    const targetDomain = new URL(target).hostname;
    
    const isAllowed = allowedDomains.some(domain => 
      targetDomain === domain || targetDomain.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      return response.status(403).json({ 
        error: `不允许代理域名: ${targetDomain}` 
      });
    }
    
    console.log('正在代理请求到:', target);
    
    // 发起请求到目标API
    const apiResponse = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });
    
    if (!apiResponse.ok) {
      throw new Error(`API响应错误: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    
    const data = await apiResponse.json();
    
    // 返回成功响应
    return response.status(200).json({
      success: true,
      data: data,
      proxiedFrom: target
    });
    
  } catch (error) {
    console.error('代理请求失败:', error);
    return response.status(500).json({
      success: false,
      error: error.message
    });
  }
}