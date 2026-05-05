package com.villafarma.model;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDate;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "dni", unique = true, nullable = false) private String dni;
    @Column(name = "first_name") private String firstName;
    @Column(name = "last_name") private String lastName;
    @Column(name = "email", unique = true) private String email;
    @Column(name = "phone") private String phone;
    @Column(name = "birth_date") private LocalDate birthDate;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "enabled") private Boolean enabled = true;
    @Column(name = "created_at", updatable = false) private Instant createdAt = Instant.now();
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
    public User() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getDni(){return dni;} public void setDni(String dni){this.dni=dni;}
    public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
    public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
    public LocalDate getBirthDate(){return birthDate;} public void setBirthDate(LocalDate birthDate){this.birthDate=birthDate;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String passwordHash){this.passwordHash=passwordHash;}
    public Boolean getEnabled(){return enabled;} public void setEnabled(Boolean enabled){this.enabled=enabled;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant createdAt){this.createdAt=createdAt;}
    public Set<Role> getRoles(){return roles;} public void setRoles(Set<Role> roles){this.roles=roles;}
    @Override public Collection<? extends GrantedAuthority> getAuthorities(){ return roles.stream().map(r->new SimpleGrantedAuthority(r.getName())).collect(Collectors.toSet()); }
    @Override public String getPassword(){ return this.passwordHash; }
    @Override public String getUsername(){ return this.dni; }
    @Override public boolean isAccountNonExpired(){ return true; }
    @Override public boolean isAccountNonLocked(){ return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled(){ return this.enabled != null ? this.enabled : true; }
}
