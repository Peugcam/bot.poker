import { useState, useEffect } from 'react';
import { playersApi } from '../services/api';

function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    discordId: '',
    discordTag: '',
    nickname: '',
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setLoading(true);
      const response = await playersApi.list();
      setPlayers(response.data);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await playersApi.create(formData);
      setFormData({ discordId: '', discordTag: '', nickname: '' });
      setShowAddForm(false);
      loadPlayers();
      alert('Jogador adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
    }
  }

  async function handleDelete(id, nickname) {
    if (!confirm(`Tem certeza que deseja remover ${nickname}?`)) {
      return;
    }

    try {
      await playersApi.delete(id);
      loadPlayers();
      alert('Jogador removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Jogadores</h2>
          <p className="text-gray-600">Gerenciar jogadores registrados no sistema</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Jogador'}
        </button>
      </div>

      {/* Formulário de Adicionar */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Novo Jogador</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discord ID *
              </label>
              <input
                type="text"
                className="input"
                value={formData.discordId}
                onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                required
                placeholder="123456789012345678"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID numérico do usuário no Discord (17-19 dígitos)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discord Tag *
              </label>
              <input
                type="text"
                className="input"
                value={formData.discordTag}
                onChange={(e) => setFormData({ ...formData, discordTag: e.target.value })}
                required
                placeholder="usuario#1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nickname (nos arquivos) *
              </label>
              <input
                type="text"
                className="input"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                placeholder="PlayerNick123"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este nome substituirá "Hero" nos arquivos de mãos
              </p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Jogadores */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Nickname
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Discord Tag
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Discord ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Cadastrado em
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Nenhum jogador cadastrado ainda
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {player.nickname}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {player.discordTag}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                      {player.discordId}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(player.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(player.id, player.nickname)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Players;
