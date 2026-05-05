
package com.villafarma.controller;

import com.villafarma.model.Category;
import com.villafarma.model.Product;
import com.villafarma.repository.CategoryRepository;
import com.villafarma.repository.ProductRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Daniel
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryController(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }
    
    //Obtener todas las categorías
    @GetMapping
    public List<Category> listAll() {
        return categoryRepository.findAll();
    }
    
    //Obtener una categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> finById(@PathVariable Long id){
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    //Obtener productos de una categoría con paginación
    @GetMapping("/{categoryId}/products")
    public ResponseEntity<Page<Product>> getProductsByCategory(@PathVariable Long categoryId,
            @RequestParam(defaultValue="0")int page,
            @RequestParam(defaultValue = "10")int size){
        //Paginación de productos dentro de la categoría
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return ResponseEntity.ok(products);
    }
    
    
}
