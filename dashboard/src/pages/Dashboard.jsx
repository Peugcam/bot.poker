import { useState, useEffect } from 'react';
import { submissionsApi, requestsApi } from '../services/api';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [statusRes, requestsRes] = await Promise.all([
        submissionsApi.getStatus(),
        requestsApi.list({ limit: 5 }),
      ]);

      setStatus(statusRes.data);
      setRecentRequests(requestsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema de gerenciamento de mãos</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Jogadores</p>
              <p className="text-3xl font-bold text-gray-900">{status?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Enviaram (24h)</p>
              <p className="text-3xl font-bold text-green-600">{status?.submittedCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{status?.pendingCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status dos Envios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enviaram */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-600">✅</span>
            Jogadores que enviaram
          </h3>

          {status?.submitted && status.submitted.length > 0 ? (
            <div className="space-y-2">
              {status.submitted.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{player.nickname}</span>
                  <span className="badge-success">{player.filesCount} arquivo(s)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum jogador enviou ainda</p>
          )}
        </div>

        {/* Pendentes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-yellow-600">⏳</span>
            Aguardando envio
          </h3>

          {status?.pending && status.pending.length > 0 ? (
            <div className="space-y-2">
              {status.pending.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-gray-900">{player.nickname}</span>
                  <span className="badge-warning">Pendente</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Todos os jogadores enviaram!</p>
          )}
        </div>
      </div>

      {/* Últimas Solicitações */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Solicitações</h3>

        {recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div key={request.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleString('pt-BR')}
                </p>
                <p className="text-gray-900 mt-1 line-clamp-2">
                  {request.message || 'Solicitação de mãos'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhuma solicitação recente</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
