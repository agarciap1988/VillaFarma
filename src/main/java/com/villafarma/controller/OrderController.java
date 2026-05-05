package com.villafarma.controller;

import com.villafarma.model.*;
import com.villafarma.repository.OrderRepository;
import com.villafarma.repository.ProductRepository;
import com.villafarma.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req, Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Usuario no atutenticado"));
        }

        System.out.println("auth =>" + auth);
        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setCreatedAt(java.time.Instant.now());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.LineItem li : req.getItems()) {
            Product product = productRepository.findById(li.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (product.getStock() < li.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Stock insuficiente para producto " + product.getName()));
            }

            product.setStock(product.getStock() - li.getQuantity());
            productRepository.save(product);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setQuantity(li.getQuantity());
            oi.setUnitPrice(product.getPrice());
            items.add(oi);

            if (req.getDelivery() != null) {
                total = total.add(req.getDelivery());
            }

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(li.getQuantity())));
        }

        order.setItems(items);
        order.setTotal(total);

        orderRepository.save(order);

        return ResponseEntity.status(201).body(
                Map.of(
                        "orderId", order.getId(),
                        "message", "Orden creada con éxito",
                        "productsTotal", total)
        );
    }

    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(Authentication auth) {
        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

        List history = orders.stream().map(o -> Map.of(
                "orderId", o.getId(),
                "fechaCompra", o.getCreatedAt(),
                "montoTotal", o.getTotal(),
                "estado", o.getStatus()
        )).toList();

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id, Authentication auth) {

        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "No tiene permiso para ver esta orden"));
        }

        List itemsDetail = order.getItems().stream()
                .map(item -> Map.of(
                "productName", item.getProduct().getName(),
                "quantity", item.getQuantity(),
                "unitPrice", item.getUnitPrice(),
                "totalItem", item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
        )).toList();

        Map<String, Object> orderDetail = Map.of(
                "orderId", order.getId(),
                "createdAt", order.getCreatedAt(),
                "total", order.getTotal(),
                "status", order.getStatus(),              
                "items", itemsDetail
        );

        return ResponseEntity.ok(orderDetail);
    }

    @PutMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "No tiene permiso para cancelar esta orden"));
        }

        if (!order.getStatus().equalsIgnoreCase("PENDING")
                && !order.getStatus().equalsIgnoreCase("CREATED")) {
            return ResponseEntity.badRequest().body(Map.of("message", "La orden no puede cancelarse en su estado actual"));
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of("message", "Orden cancelada exitosamente"));
    }

    public static class OrderRequest {

        private List<LineItem> items;
        private BigDecimal delivery;
        private String deliveryAddress;
        private String deliveryDistrict;
        private String deliveryMethod;

        public List<LineItem> getItems() {
            return items;
        }

        public void setItems(List<LineItem> items) {
            this.items = items;
        }

        public BigDecimal getDelivery() {
            return delivery;
        }

        public void setDelivery(BigDecimal delivery) {
            this.delivery = delivery;
        }

        public String getDeliveryAddress() {
            return deliveryAddress;
        }

        public void setDeliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
        }

        public String getDeliveryDistrict() {
            return deliveryDistrict;
        }

        public void setDeliveryDistrict(String deliveryDistrict) {
            this.deliveryDistrict = deliveryDistrict;
        }

        public String getDeliveryMethod() {
            return deliveryMethod;
        }

        public void setDeliveryMethod(String deliveryMethod) {
            this.deliveryMethod = deliveryMethod;
        }

        public static class LineItem {

            private Long productId;
            private Integer quantity;

            public Long getProductId() {
                return productId;
            }

            public void setProductId(Long productId) {
                this.productId = productId;
            }

            public Integer getQuantity() {
                return quantity;
            }

            public void setQuantity(Integer quantity) {
                this.quantity = quantity;
            }
        }

    }

}
