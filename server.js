// استخدم المنفذ الذي يوفره بيئة التشغيل (مثل Render) أو المنفذ 5001 بشكل افتراضي
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
}).on('error', (err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1); // أخرج من العملية مع إشارة خطأ
});
