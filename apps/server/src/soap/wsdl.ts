export const wsdlXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions
  name="ShipmentService"
  targetNamespace="http://logitrack.com.br/shipment"
  xmlns:tns="http://logitrack.com.br/shipment"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
  xmlns="http://schemas.xmlsoap.org/wsdl/">

  <types>
    <xsd:schema targetNamespace="http://logitrack.com.br/shipment" elementFormDefault="qualified">
      <xsd:simpleType name="ShipmentStatus">
        <xsd:restriction base="xsd:string">
          <xsd:enumeration value="AGUARDANDO"/>
          <xsd:enumeration value="EM_TRANSITO"/>
          <xsd:enumeration value="ENTREGUE"/>
          <xsd:enumeration value="CANCELADO"/>
        </xsd:restriction>
      </xsd:simpleType>

      <xsd:complexType name="StatusHistoricoItem">
        <xsd:sequence>
          <xsd:element name="status" type="tns:ShipmentStatus"/>
          <xsd:element name="atualizadoEm" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:complexType name="Remessa">
        <xsd:sequence>
          <xsd:element name="remessaId" type="xsd:string"/>
          <xsd:element name="clienteId" type="xsd:string"/>
          <xsd:element name="origem" type="xsd:string"/>
          <xsd:element name="destino" type="xsd:string"/>
          <xsd:element name="pesoKg" type="xsd:decimal"/>
          <xsd:element name="descricao" type="xsd:string"/>
          <xsd:element name="status" type="tns:ShipmentStatus"/>
          <xsd:element name="criadoEm" type="xsd:string"/>
          <xsd:element name="historicoStatus" type="tns:StatusHistoricoItem" minOccurs="0" maxOccurs="unbounded"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:element name="criarRemessa">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="clienteId" type="xsd:string"/>
            <xsd:element name="origem" type="xsd:string"/>
            <xsd:element name="destino" type="xsd:string"/>
            <xsd:element name="pesoKg" type="xsd:decimal"/>
            <xsd:element name="descricao" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="criarRemessaResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessaId" type="xsd:string"/>
            <xsd:element name="status" type="tns:ShipmentStatus"/>
            <xsd:element name="criadoEm" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="consultarRemessa">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessaId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="consultarRemessaResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessa" type="tns:Remessa"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="atualizarStatus">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessaId" type="xsd:string"/>
            <xsd:element name="status" type="tns:ShipmentStatus"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="atualizarStatusResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessaId" type="xsd:string"/>
            <xsd:element name="status" type="tns:ShipmentStatus"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="listarRemessas">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="status" type="tns:ShipmentStatus" minOccurs="0"/>
            <xsd:element name="clienteId" type="xsd:string" minOccurs="0"/>
            <xsd:element name="pagina" type="xsd:int" minOccurs="0"/>
            <xsd:element name="tamanhoPagina" type="xsd:int" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="listarRemessasResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="remessas" type="tns:Remessa" minOccurs="0" maxOccurs="unbounded"/>
            <xsd:element name="pagina" type="xsd:int"/>
            <xsd:element name="tamanhoPagina" type="xsd:int"/>
            <xsd:element name="total" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="RemessaNaoEncontradaFault">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="StatusInvalidoFault">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ValidacaoFault">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="CriarRemessaRequest"><part name="parameters" element="tns:criarRemessa"/></message>
  <message name="CriarRemessaResponse"><part name="parameters" element="tns:criarRemessaResponse"/></message>
  <message name="ConsultarRemessaRequest"><part name="parameters" element="tns:consultarRemessa"/></message>
  <message name="ConsultarRemessaResponse"><part name="parameters" element="tns:consultarRemessaResponse"/></message>
  <message name="AtualizarStatusRequest"><part name="parameters" element="tns:atualizarStatus"/></message>
  <message name="AtualizarStatusResponse"><part name="parameters" element="tns:atualizarStatusResponse"/></message>
  <message name="ListarRemessasRequest"><part name="parameters" element="tns:listarRemessas"/></message>
  <message name="ListarRemessasResponse"><part name="parameters" element="tns:listarRemessasResponse"/></message>

  <message name="RemessaNaoEncontradaFaultMessage"><part name="fault" element="tns:RemessaNaoEncontradaFault"/></message>
  <message name="StatusInvalidoFaultMessage"><part name="fault" element="tns:StatusInvalidoFault"/></message>
  <message name="ValidacaoFaultMessage"><part name="fault" element="tns:ValidacaoFault"/></message>

  <portType name="ShipmentPortType">
    <operation name="criarRemessa">
      <input message="tns:CriarRemessaRequest"/>
      <output message="tns:CriarRemessaResponse"/>
      <fault name="ValidacaoFault" message="tns:ValidacaoFaultMessage"/>
    </operation>
    <operation name="consultarRemessa">
      <input message="tns:ConsultarRemessaRequest"/>
      <output message="tns:ConsultarRemessaResponse"/>
      <fault name="RemessaNaoEncontradaFault" message="tns:RemessaNaoEncontradaFaultMessage"/>
      <fault name="ValidacaoFault" message="tns:ValidacaoFaultMessage"/>
    </operation>
    <operation name="atualizarStatus">
      <input message="tns:AtualizarStatusRequest"/>
      <output message="tns:AtualizarStatusResponse"/>
      <fault name="RemessaNaoEncontradaFault" message="tns:RemessaNaoEncontradaFaultMessage"/>
      <fault name="StatusInvalidoFault" message="tns:StatusInvalidoFaultMessage"/>
      <fault name="ValidacaoFault" message="tns:ValidacaoFaultMessage"/>
    </operation>
    <operation name="listarRemessas">
      <input message="tns:ListarRemessasRequest"/>
      <output message="tns:ListarRemessasResponse"/>
      <fault name="StatusInvalidoFault" message="tns:StatusInvalidoFaultMessage"/>
      <fault name="ValidacaoFault" message="tns:ValidacaoFaultMessage"/>
    </operation>
  </portType>

  <binding name="ShipmentBinding" type="tns:ShipmentPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>

    <operation name="criarRemessa">
      <soap:operation soapAction="criarRemessa"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
      <fault name="ValidacaoFault"><soap:fault name="ValidacaoFault" use="literal"/></fault>
    </operation>

    <operation name="consultarRemessa">
      <soap:operation soapAction="consultarRemessa"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
      <fault name="RemessaNaoEncontradaFault"><soap:fault name="RemessaNaoEncontradaFault" use="literal"/></fault>
      <fault name="ValidacaoFault"><soap:fault name="ValidacaoFault" use="literal"/></fault>
    </operation>

    <operation name="atualizarStatus">
      <soap:operation soapAction="atualizarStatus"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
      <fault name="RemessaNaoEncontradaFault"><soap:fault name="RemessaNaoEncontradaFault" use="literal"/></fault>
      <fault name="StatusInvalidoFault"><soap:fault name="StatusInvalidoFault" use="literal"/></fault>
      <fault name="ValidacaoFault"><soap:fault name="ValidacaoFault" use="literal"/></fault>
    </operation>

    <operation name="listarRemessas">
      <soap:operation soapAction="listarRemessas"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
      <fault name="StatusInvalidoFault"><soap:fault name="StatusInvalidoFault" use="literal"/></fault>
      <fault name="ValidacaoFault"><soap:fault name="ValidacaoFault" use="literal"/></fault>
    </operation>
  </binding>

  <service name="ShipmentService">
    <port name="ShipmentPort" binding="tns:ShipmentBinding">
      <soap:address location="http://localhost:3001/shipment"/>
    </port>
  </service>
</definitions>`;
