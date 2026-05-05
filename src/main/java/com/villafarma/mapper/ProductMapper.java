package com.villafarma.mapper;


import com.villafarma.dto.request.ProductRequestDTO;
import com.villafarma.dto.response.ProductResponseDTO;
import com.villafarma.model.Product;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


/**
 *
 * @author Daniel
 */

@Mapper(componentModel = "spring")
public interface ProductMapper {

    //Convertir de Product a ProductResponseDTO
    @Mapping(target = "categoryId",source = "category.id") //Mapea la categoria a categoryId en el DTO
    @Mapping(target = "id",source = "id") //Asegura que id se mapee correctamente
    ProductResponseDTO toResponseDTO (Product product);
    
    //Convertir de ProductRequestDTO a Product (para creación y actualización)
    @Mapping(target = "category.id",source = "categoryId")
    @Mapping(target = "id",ignore = true)//Ignora el id al crear un nuevo producto (se genera automáticamente)
    Product toEntity(ProductRequestDTO productRequestDTO); 
    
    //Convertir lista de Product a lista de ProductResponseDTO
    List<ProductResponseDTO> toResponseDTOList(List<Product> products);
    
    //Convertir lista de ProductRequestDTO a lista de Product
    List<Product> toEntityList(List<ProductRequestDTO> productRequestDTOs);
    
}
