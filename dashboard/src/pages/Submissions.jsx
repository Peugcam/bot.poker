import { useState, useEffect } from 'react';
import { submissionsApi } from '../services/api';

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, gg, outros, verified, pending

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  async function loadSubmissions() {
    try {
      setLoading(true);

      const params = {};

      if (filter === 'gg') params.isGG = 'true';
      if (filter === 'outros') params.isGG = 'false';
      if (filter === 'verified') params.verified = 'true';
      if (filter === 'pending') params.verified = 'false';

      const response = await submissionsApi.list(params);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id) {
    try {
      await submissionsApi.verify(id);
      loadSubmissions();
      alert('Submissão verificada!');
    } catch (error) {
      console.error('Erro ao verificar:', error);
    }
  }

  async function handleDownload(id, fileName) {
    try {
      const response = await submissionsApi.download(id);

      // Cria link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  }

  async function handleDownloadBatch(category) {
    try {
      const response = await submissionsApi.downloadBatch(category);
      const files = response.data.files;

      if (files.length === 0) {
        alert('Nenhum arquivo verificado nesta categoria');
        return;
      }

      // Aviso ao usuário
      if (!confirm(`Baixar ${files.length} arquivo(s) da categoria ${category.toUpperCase()}?`)) {
        return;
      }

      // Baixa cada arquivo (em produção, considere criar ZIP no backend)
      for (const file of files) {
        await handleDownload(file.id, file.fileName);
        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      alert(`${files.length} arquivo(s) baixado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao baixar lote:', error);
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submissões</h2>
        <p className="text-gray-600">Gerenciar arquivos enviados pelos jogadores</p>
      </div>

      {/* Filtros e Ações */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('gg')}
              className={filter === 'gg' ? 'btn-primary' : 'btn-secondary'}
            >
              GGPoker
            </button>
            <button
              onClick={() => setFilter('outros')}
              className={filter === 'outros' ? 'btn-primary' : 'btn-secondary'}
            >
              Outros
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={filter === 'verified' ? 'btn-success' : 'btn-secondary'}
            >
              Verificados
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'btn-secondary' : 'btn-secondary'}
            >
              Pendentes
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadBatch('gg')}
              className="btn-success text-sm"
            >
              📥 Baixar Lote GG
            </button>
            <button
              onClick={() => handleDownloadBatch('outros')}
              className="btn-success text-sm"
            >
              📥 Baixar Lote Outros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Submissões */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Jogador
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Arquivo
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Site
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Nenhuma submissão encontrada
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {submission.Player?.nickname || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {submission.processedFileName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          submission.isGG
                            ? 'badge bg-purple-100 text-purple-800'
                            : 'badge bg-gray-100 text-gray-800'
                        }
                      >
                        {submission.isGG ? 'GGPoker' : 'Outros'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(submission.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      {submission.verified ? (
                        <span className="badge-success">✓ Verificado</span>
                      ) : (
                        <span className="badge-warning">⏳ Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {!submission.verified && (
                          <button
                            onClick={() => handleVerify(submission.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Verificar
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDownload(submission.id, submission.processedFileName)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Download
                        </button>
                      </div>
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

export default Submissions;
