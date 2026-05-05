package com.villafarma.repository;
import com.villafarma.model.Order;
import com.villafarma.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderRepository extends JpaRepository<Order, Long> {
List<Order> findByUserOrderByCreatedAtDesc(User user);
}
