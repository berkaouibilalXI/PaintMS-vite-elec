import { useState, useEffect } from "react";
import { ChartNoAxesCombined } from "lucide-react"; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import { StatCard } from "../components/ui/stats-card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import clientService from "../services/clientService";
import productService from "../services/productService";
import invoiceService from "../services/invoiceService";
import { useDarkMode } from "../context/DarkModeContext";
import { Users, FileText, BoxIcon, Boxes} from "lucide-react";
import { getArrayLength } from '../utils/helpers'

function DashboardPage() {
  const { darkMode } = useDarkMode();
  const [clientCount, setClientCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch clients
        try {
          const clients = await clientService.getClients();
          const count = getArrayLength(clients);
          setClientCount(count);
          console.log(count);
        } catch (error) {
          console.error('Error fetching clients:', error);
          setClientCount(0);
        }

        // Fetch products
        try {
          const products = await productService.getProducts();
          setProductCount(products.length);
        } catch (error) {
          console.error('Error fetching products:', error);
          setProductCount(0);
        }

        // Fetch invoices
        try {
          const invoices = await invoiceService.getInvoices();
          setInvoiceCount(invoices.length);
        } catch (error) {
          console.error('Error fetching invoices:', error);
          setInvoiceCount(0);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchCounts();
  }, []);

  // Chart options with dark mode support
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: false 
      },
      title: { 
        display: true, 
        text: "Achats de produits (6 derniers mois)", 
        font: { size: 18 },
        color: darkMode ? '#e5e7eb' : '#374151'
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
  };

  

  const QuickActionCard = ({ to, title, subtitle, icon, variant = "default" }) => (
    <Link to={to} className="block group">
      <div className={`
        bg-card border-2 rounded-lg p-6 shadow-sm transition-all duration-200 
        group-hover:shadow-md group-hover:scale-[1.02] 
        ${variant === "primary" 
          ? "border-primary/30 bg-primary/5 group-hover:border-primary/50" 
          : "border-dashed border-border group-hover:border-primary/30"
        }
      `}>
        <div className="flex items-center space-x-4">
          <div className={`
            p-3 rounded-lg transition-colors duration-200
            ${variant === "primary" 
              ? "bg-primary text-primary-foreground group-hover:bg-primary/90" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            }
          `}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de votre activité</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            to="/factures"
            title="Factures"
            subtitle="Gérer vos factures"
            variant="primary"
            icon={<FileText className="h-6 w-6" />}
          />
          
          <QuickActionCard
            to="/clients"
            title="Clients"
            subtitle="Gérer vos clients"
            icon={<Users className="h-6 w-6" />}
          />
          
          <QuickActionCard
            to="/produits"
            title="Produits"
            subtitle="Gérer vos produits"
            icon={<BoxIcon className="h-6 w-6" />}
          />
        </div>

        <Separator className="my-8" />

        {/* Statistics and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Statistiques</h2>
            
            <StatCard
              title="Nombre de clients"
              value={clientCount}
              loading={loading}
              icon={<Users className="h-6 w-6 text-primary" />}
            />
            
            <StatCard
              title="Nombre de produits"
              value={productCount}
              loading={loading}
              icon={<Boxes className="h-6 w-6 text-primary" />}
            />
            
            <StatCard
              title="Nombre de bons"
              value={invoiceCount}
              loading={loading}
              icon={<FileText className="h-6 w-6 text-primary" />}
            />
          </div>

          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Achats de produits
              </h2>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Placeholder for chart - you can add actual chart data here */}
                <div className="text-center">
                  <ChartNoAxesCombined className="h-32 w-32 mx-auto mb-4" />
                  <p className="text-sm">Graphique des achats</p>
                  <p className="text-xs text-muted-foreground mt-1">Données à venir</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;