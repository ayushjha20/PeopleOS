package com.example.demo.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Employee_Crud")
public class Employee {

    @Id
    @Column(
        unique = true,
        nullable = true
    )
    private long id;

    private String name;

    private String domain;

    private int Salary;

    private String Email;

    private String password;

}