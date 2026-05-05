package com.villafarma.mapper;

import com.villafarma.dto.request.CategoryRequestDTO;
import com.villafarma.dto.response.CategoryResponseDTO;
import com.villafarma.model.Category;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 *
 * package com.villafarma.mapper;
 *
 * Mapper para convertir entre Category y CategoryRequestDTO, CategoryResponseDTO
 * Usando ProductMapper para mapear productos en Category
 *
 * @author Daniel
 */
@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface CategoryMapper {
    
    //Convetir Category a CategoryResponseDTO
    @Mapping(target = "productResponseDTOs",source="products")//Mapear la lista de productos a productResponseDTOs
    @Mapping(target = "id",source = "id")
    @Mapping(target = "imageUrl",source = "imageUrl")
    CategoryResponseDTO toResponseDTO(Category category);
    
    //Convertir CategoryRequestDTO a Category
    @Mapping(target = "imageUrl",source = "imageUrl")
    @Mapping(target = "id",ignore = true)
    @Mapping(target = "products",ignore = true)
    Category toEntity(CategoryRequestDTO categoryRequestDTO);
    
    //Mapear lista de Category a lista de CategoryResponseDTO
    List<CategoryResponseDTO> toResponseDtoList(List<Category> categories);
    
    //Mapear lista de CategoryRequestDTO a lista de Category
    List<Category> toEntityList(List<CategoryRequestDTO> categoryRequestDTOs);
    
}