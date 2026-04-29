import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const ForbiddenPage = () => {
  return (
    <PageContainer>
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Anda tidak memiliki izin untuk membuka halaman ini. Hubungi admin jika diperlukan.
          </p>
          <Link to="/dashboard" className="mt-4 inline-flex">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ForbiddenPage;
