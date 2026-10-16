import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Home } from "lucide-react";

export default function SuccessPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // تنظيف sessionStorage بعد النجاح
    const timer = setTimeout(() => {
      sessionStorage.removeItem("personalData");
      sessionStorage.removeItem("loginData");
      sessionStorage.removeItem("otpCode");
      sessionStorage.removeItem("tokenCode");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background flex items-center justify-center" dir="rtl">
      {/* محتوى الصفحة */}
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl"></div>
                <CheckCircle2 className="w-24 h-24 text-accent relative" />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">تم بنجاح!</h2>
            <p className="text-muted-foreground mb-8">
              تم استقبال طلبك بنجاح. سيتم التواصل معك قريباً لتأكيد الطلب وتسليم ساعتك الذكية المجانية.
            </p>

            <div className="bg-secondary/50 rounded-lg p-4 mb-8 text-sm">
              <p className="font-semibold mb-2">معلومات الطلب:</p>
              <p className="text-muted-foreground">
                تحقق من بريدك الإلكتروني للحصول على تفاصيل الطلب
              </p>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="w-full button-primary gap-2"
            >
              <Home className="w-4 h-4" />
              العودة إلى الصفحة الرئيسية
            </Button>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>شكراً لاختيارك بنك المشرق</p>
          </div>
        </div>
      </div>
    </div>
  );
}
