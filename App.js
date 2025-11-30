import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';

// Versão SIMPLIFICADA para build online
export default function App() {
  const [clientes, setClientes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCompraVisible, setModalCompraVisible] = useState(false);
  const [modalPagamentoVisible, setModalPagamentoVisible] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Estados para formulários
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [limiteCliente, setLimiteCliente] = useState('500');
  const [valorCompra, setValorCompra] = useState('');
  const [descricaoCompra, setDescricaoCompra] = useState('');
  const [valorPagamento, setValorPagamento] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    setClientes([
      {
        id: '1',
        nome: 'Maria Santos',
        telefone: '(11) 98888-7777',
        fiado: 350.00,
        limite: 1000.00
      },
      {
        id: '2', 
        nome: 'José Oliveira',
        telefone: '(11) 97777-6666',
        fiado: 0.00,
        limite: 800.00
      }
    ]);
  }, []);

  // Salvar dados localmente (simulação)
  useEffect(() => {
    // Em app real, salvaríamos com AsyncStorage
  }, [clientes]);

  const adicionarCliente = () => {
    if (!nomeCliente.trim()) {
      Alert.alert('Atenção', 'Digite o nome do cliente');
      return;
    }

    const novoCliente = {
      id: Date.now().toString(),
      nome: nomeCliente,
      telefone: telefoneCliente,
      fiado: 0.00,
      limite: parseFloat(limiteCliente) || 500.00
    };

    setClientes([...clientes, novoCliente]);
    setNomeCliente('');
    setTelefoneCliente('');
    setLimiteCliente('500');
    setModalVisible(false);
    Alert.alert('Sucesso!', 'Cliente adicionado!');
  };

  const adicionarCompra = () => {
    if (!valorCompra || parseFloat(valorCompra) <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido');
      return;
    }

    const valor = parseFloat(valorCompra);
    
    if (!clienteSelecionado) return;

    const novoFiado = clienteSelecionado.fiado + valor;

    if (novoFiado > clienteSelecionado.limite) {
      Alert.alert('Limite Excedido', 
        `Limite disponível: R$ ${(clienteSelecionado.limite - clienteSelecionado.fiado).toFixed(2)}`);
      return;
    }

    const clientesAtualizados = clientes.map(cliente => {
      if (cliente.id === clienteSelecionado.id) {
        return {
          ...cliente,
          fiado: novoFiado
        };
      }
      return cliente;
    });

    setClientes(clientesAtualizados);
    setValorCompra('');
    setDescricaoCompra('');
    setModalCompraVisible(false);
    Alert.alert('Sucesso!', `Compra de R$ ${valor.toFixed(2)} registrada!`);
  };

  const registrarPagamento = () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido para pagamento');
      return;
    }

    const valor = parseFloat(valorPagamento);
    
    if (!clienteSelecionado) return;

    if (valor > clienteSelecionado.fiado) {
      Alert.alert('Valor excedido', 
        `O valor do pagamento (R$ ${valor.toFixed(2)}) não pode ser maior que o fiado (R$ ${clienteSelecionado.fiado.toFixed(2)})`);
      return;
    }

    const novoFiado = clienteSelecionado.fiado - valor;

    const clientesAtualizados = clientes.map(cliente => {
      if (cliente.id === clienteSelecionado.id) {
        return {
          ...cliente,
          fiado: novoFiado
        };
      }
      return cliente;
    });

    setClientes(clientesAtualizados);
    setValorPagamento('');
    setModalPagamentoVisible(false);
    
    if (novoFiado === 0) {
      Alert.alert('Pagamento Concluído!', `Débito quitado totalmente!`);
    } else {
      Alert.alert('Pagamento Registrado!', 
        `Pagamento de R$ ${valor.toFixed(2)} realizado!\nSaldo restante: R$ ${novoFiado.toFixed(2)}`);
    }
  };

  const abrirModalPagamento = (cliente) => {
    setClienteSelecionado(cliente);
    setValorPagamento(cliente.fiado.toString());
    setModalPagamentoVisible(true);
  };

  const excluirCliente = (cliente) => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir ${cliente.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            const clientesAtualizados = clientes.filter(c => c.id !== cliente.id);
            setClientes(clientesAtualizados);
            Alert.alert('Sucesso!', 'Cliente excluído!');
          }
        }
      ]
    );
  };

  const totalFiado = clientes.reduce((total, cliente) => total + cliente.fiado, 0);
  const clientesEmDebito = clientes.filter(cliente => cliente.fiado > 0).length;

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.titulo}>🏪 Controle de Fiado</Text>
        <TouchableOpacity 
          style={styles.botaoAdicionar}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textoBotaoAdicionar}>+</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE CLIENTES */}
      <ScrollView style={styles.lista}>
        {clientes.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Text style={styles.textoVazio}>📝</Text>
            <Text style={styles.textoVazio}>Nenhum cliente cadastrado</Text>
            <Text style={styles.textoVazioPequeno}>Toque no + para adicionar</Text>
          </View>
        ) : (
          clientes.map(cliente => (
            <View 
              key={cliente.id} 
              style={[
                styles.cartaoCliente,
                cliente.fiado > 0 && styles.clienteComFiado
              ]}
            >
              <View style={styles.cabecalhoCliente}>
                <Text style={styles.nomeCliente}>{cliente.nome}</Text>
                <Text style={[
                  styles.valorFiado,
                  cliente.fiado > 0 ? styles.fiadoPendente : styles.fiadoQuitado
                ]}>
                  R$ {cliente.fiado.toFixed(2)}
                </Text>
              </View>
              
              <Text style={styles.infoCliente}>📞 {cliente.telefone}</Text>
              <Text style={styles.infoCliente}>
                Limite: R$ {cliente.limite.toFixed(2)}
              </Text>

              <View style={styles.botoesAcao}>
                <TouchableOpacity 
                  style={styles.botaoComprar}
                  onPress={() => {
                    setClienteSelecionado(cliente);
                    setModalCompraVisible(true);
                  }}
                >
                  <Text style={styles.textoBotao}>🛒 Comprar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.botaoPagar,
                    cliente.fiado === 0 && styles.botaoDesabilitado
                  ]}
                  onPress={() => abrirModalPagamento(cliente)}
                  disabled={cliente.fiado === 0}
                >
                  <Text style={styles.textoBotao}>
                    {cliente.fiado === 0 ? '✅ Quitado' : '💳 Pagar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.botaoExcluir}
                onPress={() => excluirCliente(cliente)}
              >
                <Text style={styles.textoBotaoExcluir}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* RODAPÉ COM RESUMO */}
      <View style={styles.rodape}>
        <Text style={styles.textoRodape}>
          💰 Total: R$ {totalFiado.toFixed(2)}
        </Text>
        <Text style={styles.textoRodape}>
          👥 {clientes.length} clientes | ⚠️ {clientesEmDebito} em débito
        </Text>
      </View>

      {/* MODAIS (mantenha os mesmos do código anterior) */}
      {/* Modal Adicionar Cliente */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>➕ Novo Cliente</Text>
            <TextInput style={styles.campoInput} placeholder="Nome *" value={nomeCliente} onChangeText={setNomeCliente} />
            <TextInput style={styles.campoInput} placeholder="Telefone" value={telefoneCliente} onChangeText={setTelefoneCliente} />
            <TextInput style={styles.campoInput} placeholder="Limite" value={limiteCliente} onChangeText={setLimiteCliente} keyboardType="numeric" />
            <View style={styles.botoesModal}>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoCancelar]} onPress={() => setModalVisible(false)}>
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoSalvar]} onPress={adicionarCliente}>
                <Text style={styles.textoBotaoModal}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Compra */}
      <Modal visible={modalCompraVisible} transparent animationType="slide">
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>🛒 Nova Compra</Text>
            {clienteSelecionado && (
              <>
                <Text style={styles.nomeClienteSelecionado}>{clienteSelecionado.nome}</Text>
                <Text style={styles.infoModal}>Fiado: R$ {clienteSelecionado.fiado.toFixed(2)}</Text>
                <Text style={styles.infoModal}>Disponível: R$ {(clienteSelecionado.limite - clienteSelecionado.fiado).toFixed(2)}</Text>
              </>
            )}
            <TextInput style={styles.campoInput} placeholder="Valor *" value={valorCompra} onChangeText={setValorCompra} keyboardType="numeric" />
            <TextInput style={styles.campoInput} placeholder="Descrição" value={descricaoCompra} onChangeText={setDescricaoCompra} />
            <View style={styles.botoesModal}>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoCancelar]} onPress={() => setModalCompraVisible(false)}>
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoSalvar]} onPress={adicionarCompra}>
                <Text style={styles.textoBotaoModal}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pagamento */}
      <Modal visible={modalPagamentoVisible} transparent animationType="slide">
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>💳 Pagamento</Text>
            {clienteSelecionado && (
              <>
                <Text style={styles.nomeClienteSelecionado}>{clienteSelecionado.nome}</Text>
                <Text style={styles.infoModal}>Fiado: R$ {clienteSelecionado.fiado.toFixed(2)}</Text>
                <TextInput style={styles.campoInput} placeholder="Valor *" value={valorPagamento} onChangeText={setValorPagamento} keyboardType="numeric" />
                <TouchableOpacity style={styles.botaoSugestao} onPress={() => setValorPagamento(clienteSelecionado.fiado.toString())}>
                  <Text style={styles.textoBotaoSugestao}>💡 Pagar total (R$ {clienteSelecionado.fiado.toFixed(2)})</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.botoesModal}>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoCancelar]} onPress={() => setModalPagamentoVisible(false)}>
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoModal, styles.botaoSalvar]} onPress={registrarPagamento}>
                <Text style={styles.textoBotaoModal}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ESTILOS (use os mesmos do código anterior)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  botaoAdicionar: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  textoBotaoAdicionar: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  lista: { flex: 1, padding: 15 },
  vazioContainer: { alignItems: 'center', marginTop: 100 },
  textoVazio: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 10 },
  textoVazioPequeno: { fontSize: 14, color: '#999', textAlign: 'center' },
  cartaoCliente: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  clienteComFiado: { borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  cabecalhoCliente: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  nomeCliente: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  valorFiado: { fontSize: 16, fontWeight: 'bold' },
  fiadoPendente: { color: '#FF3B30' },
  fiadoQuitado: { color: '#4CAF50' },
  infoCliente: { fontSize: 14, color: '#666', marginBottom: 2 },
  botoesAcao: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botaoComprar: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
  botaoPagar: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
  botaoDesabilitado: { backgroundColor: '#CCCCCC' },
  botaoExcluir: { marginTop: 10, padding: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  textoBotaoExcluir: { color: '#FF3B30', fontWeight: 'bold' },
  textoBotao: { color: 'white', fontWeight: 'bold' },
  rodape: { backgroundColor: 'white', padding: 15, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  textoRodape: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 5 },
  fundoModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  conteudoModal: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%', maxWidth: 400 },
  tituloModal: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  nomeClienteSelecionado: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  infoModal: { textAlign: 'center', marginBottom: 5, color: '#666' },
  campoInput: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 5, marginBottom: 10, fontSize: 16 },
  botaoSugestao: { backgroundColor: '#FFF3CD', padding: 10, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: '#FFEaa0' },
  textoBotaoSugestao: { color: '#856404', textAlign: 'center', fontWeight: 'bold' },
  botoesModal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botaoModal: { flex: 1, padding: 15, borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
  botaoCancelar: { backgroundColor: '#8E8E93' },
  botaoSalvar: { backgroundColor: '#007AFF' },
  textoBotaoModal: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
