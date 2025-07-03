package com.example.domain;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Email;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Produto {
    
    private String id;
    
    @NotEmpty(message = "Código do produto é obrigatório")
    @Size(max = 20)
    private String codigo;
    
    @NotEmpty(message = "Nome do produto é obrigatório")
    @Size(max = 200)
    private String nome;
    
    @Size(max = 1000)
    private String descricao;
    
    @NotNull
    private BigDecimal preco;
    
    private Integer estoque;
    
    @NotNull
    private StatusProduto statusProduto;
    
    private boolean ativo;
    
    private LocalDateTime dataCreated;
    
    private LocalDateTime dataUpdated;
    
    // Construtores, getters e setters...
    public Produto() {}
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    // ... outros getters/setters
}

enum StatusProduto {
    ATIVO,
    INATIVO,
    DESCONTINUADO,
    EM_PROMOCAO
}