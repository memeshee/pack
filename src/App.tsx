import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ComingNext } from '@/components/layout/ComingNext';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import PackPage from './pages/PackPage';

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pack/:address" element={<PackPage />} />
                <Route
                    path="/create"
                    element={<ComingNext eyebrow="Create" title="What's the plan?" line="Name it, set the goal and the approval rule, and get one link to share. Arriving in the next build." />}
                />
                <Route
                    path="/packs"
                    element={<ComingNext eyebrow="Your packs" title="Every pack you've backed." line="Sign in and see the pots you're part of, with their status. Arriving in the next build." />}
                />
                <Route
                    path="/proof"
                    element={<ComingNext eyebrow="Proof" title="Don't trust us. Check." line="Each pack's ledger reconstructed from DogeOS events, balance against balance. Arriving in the next build." />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
        </>
    );
};

export default App;
