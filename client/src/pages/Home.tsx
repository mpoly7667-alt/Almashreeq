import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Globe, Smartphone, Clock, Phone, Mail, Lock } from "lucide-react";

const WATCHES = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `ساعة ذكية ${i + 1}`,
  image: `🕐`,
}));

const FEATURES = [
  { icon: Zap, label: "دفع تلامسي" },
  { icon: Heart, label: "Apple Pay" },
  { icon: Smartphone, label: "Google Pay" },
  { icon: Clock, label: "Samsung Pay" },
  { icon: Zap, label: "بطارية 14 يوم" },
  { icon: Globe, label: "دعم اللغات" },
];

export default function Home() {
  const [, navigate] = useLocation();

  const handleOrderClick = () => {
    navigate("/order/personal-data");
  };

  return (
    <div className="min-h-screen" dir="rtl" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      {/* الهيدر */}
      <header className="header-nav sticky top-0 z-40">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-accent">بنك المشرق</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              تسجيل الدخول
            </Button>
            <Button variant="ghost">English</Button>
          </div>
        </div>
      </header>

      {/* قسم الترحيب */}
      <section className="section-padding bg-gradient-to-b from-accent/10 to-background">
        <div className="container text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            أهلاً بك في بنك المشرق مصر
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            حضور قوي في السوق المصرفي المصري منذ عام 1977
          </p>
          <p className="text-base text-muted-foreground">
            احصل على ساعة ذكية مجانية من بنك المشرق
          </p>
        </div>
      </section>

      {/* قسم المميزات */}
      <section className="section-padding">
        <div className="container">
          <h3 className="section-title">مميزات الساعات الذكية</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="feature-card text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-accent" />
                  <p className="text-sm font-semibold">{feature.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* قسم الساعات */}
      <section className="section-padding bg-secondary/5">
        <div className="container">
          <h3 className="section-title">اختر ساعتك المفضلة</h3>
          <div className="grid grid-cols-1  lg:grid-cols-4 gap-6">
            {WATCHES.map((watch) => (
              <div key={watch.id} className="watch-card">
                <div className="text-6xl text-center mb-4">{watch.image}</div>
                <h4 className="text-xl font-bold mb-2 text-center">{watch.name}</h4>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  هدية مجانية مقدمة من بنك المشرق
                </p>
                <Button
                  onClick={handleOrderClick}
                  className="w-full button-primary"
                >
                  اطلب ساعتك الان
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="footer-section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">بنك المشرق</h4>
              <p className="text-sm text-muted-foreground">
                بنك رائد في السوق المصرفي المصري
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">الروابط</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition">
                    سياسة الخصوصية
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition">
                    الشروط والأحكام
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">خدمة العملاء</h4>
              <p className="text-sm text-muted-foreground">19900</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-muted-foreground">0223456789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@mashreq.com" className="text-muted-foreground hover:text-accent transition">
                    info@mashreq.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 بنك المشرق مصر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
