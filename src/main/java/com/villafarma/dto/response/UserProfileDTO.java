
package com.villafarma.dto.response;

import java.time.LocalDate;

/**
 *
 * @author Daniel
 */
public class UserProfileDTO {
    
    private String firstName;
    private String lastName;
    private String dni;
    private String phone;
    private LocalDate birthDate;
    private String email;
    
    public UserProfileDTO() {
    }

    public UserProfileDTO(String firstName,String lastName, String dni, String phone, 
            String email,
            LocalDate birthDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.dni = dni;
        this.phone = phone;
        this.birthDate = birthDate;
        this.email = email;
    }
    

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
}
