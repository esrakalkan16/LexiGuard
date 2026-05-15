import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '../api/supabase';

const ContractsContext = createContext();

// Minimum yenileme süresi: 30 saniye (ağ trafiğini azaltır)
const STALE_TIME = 30_000;

export const ContractsProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const lastFetchRef = useRef(0);
  const fetchingRef = useRef(false);

  const fetchContracts = useCallback(async (force = false) => {
    // Eğer zaten fetch yapılıyorsa tekrar başlatma
    if (fetchingRef.current) return;

    // Veriler 30 saniyeden taze ise tekrar çekme (force olmadıkça)
    const now = Date.now();
    if (!force && lastFetchRef.current && (now - lastFetchRef.current) < STALE_TIME) {
      return;
    }

    fetchingRef.current = true;
    // Sadece ilk yüklemede loading göster, refresh'lerde gösterme
    if (contracts.length === 0) {
      setLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // analysis_results'ı sadece sonuç ekranında lazım olduğunda çekelim
        // Liste ekranlarında SADECE hafif veri çekiyoruz
        const { data, error } = await supabase
          .from('contracts')
          .select('id, filename, risk_score, created_at, analysis_results')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (data && !error) {
          setContracts(data);
          lastFetchRef.current = Date.now();
        }
      }
    } catch (error) {
      console.log("Veri çekilirken hata:", error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [contracts.length]);

  // Yeni analiz ekledikten sonra listeye anında ekleme (DB'den tekrar çekmeden)
  const addContract = useCallback((newContract) => {
    setContracts(prev => [newContract, ...prev]);
    // Arka planda gerçek veriyi çek (DB'den ID vs almak için)
    lastFetchRef.current = 0; // Bir sonraki focus'ta yenilenecek
  }, []);

  // Zorla yenileme (pull-to-refresh için)
  const forceRefresh = useCallback(async () => {
    lastFetchRef.current = 0;
    await fetchContracts(true);
  }, [fetchContracts]);

  return (
    <ContractsContext.Provider value={{
      contracts,
      loading,
      user,
      fetchContracts,
      addContract,
      forceRefresh,
    }}>
      {children}
    </ContractsContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
};
