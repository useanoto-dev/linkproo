import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-7xl font-bold text-gradient mb-2">404</div>
        <h1 className="text-xl font-bold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            Início
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;