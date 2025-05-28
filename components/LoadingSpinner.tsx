export default function LoadingSpinner() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600">
        Analisando rotas com algoritmo de grafos...
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Calculando o caminho mais eficiente
      </p>
    </div>
  );
}
