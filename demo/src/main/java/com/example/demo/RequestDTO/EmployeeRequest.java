package com.example.demo.RequestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class EmployeeRequest { // taking the user request

    private Long id;

    @NotNull(message = "Kindly enter the name!!")
    private String name;

    private String domain;

    @Min(value = 20000, message = "Salary should be more than 20000")
    private int Salary;

    @Email(message = "kindly enter the proper email id")
    private String Email;

    private String password;
}