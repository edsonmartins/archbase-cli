@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDto> buscarPorId(@PathVariable Long id) {
        ClienteDto cliente = clienteService.buscarPorId(id);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<ClienteDto> buscarPorCpf(@PathVariable String cpf) {
        ClienteDto cliente = clienteService.buscarPorCpf(cpf);
        return ResponseEntity.ok(cliente);
    }

    @PostMapping
    public ResponseEntity<ClienteDto> criar(@RequestBody ClienteDto cliente) {
        ClienteDto novoCliente = clienteService.criar(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoCliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDto> atualizar(@PathVariable Long id, @RequestBody ClienteDto cliente) {
        ClienteDto clienteAtualizado = clienteService.atualizar(id, cliente);
        return ResponseEntity.ok(clienteAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        clienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ClienteDto>> listarAtivos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<ClienteDto> clientes = clienteService.listarAtivos(page, size);
        return ResponseEntity.ok(clientes);
    }

    @PostMapping("/{id}/ativar")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        clienteService.ativar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        clienteService.desativar(id);
        return ResponseEntity.ok().build();
    }
}