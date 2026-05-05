
package com.villafarma.repository;

import com.villafarma.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author anthony
 */
public interface CategoryRepository extends JpaRepository<Category,Long>{
    
}
