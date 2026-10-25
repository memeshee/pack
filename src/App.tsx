import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import PackPage from './pages/PackPage';
import CreatePage from './pages/CreatePage';
import MyPacksPage from './pages/MyPacksPage';
import ProofPage from './pages/ProofPage';

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/pack/:address" element={<PackPage />} />
                <Route path="/packs" element={<MyPacksPage />} />
                <Route path="/proof" element={<ProofPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
        </>
    );
};

export default App;
