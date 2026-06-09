// SmartClass model: devuelve datos mockeados por ahora

export async function getHealthData() {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}
